'use client';

import { useEffect, useRef, useState } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application, SPEObject } from '@splinetool/runtime';

const SCENE_URL = 'https://prod.spline.design/Le2iIYYasafjz8Ib/scene.splinecode';

/** Approximate world-unit footprint of the diorama (shop + trees). */
const SCENE_WIDTH = 300;
const SCENE_HEIGHT = 240;
/** Camera orbit radius authored in the scene (camera sits at z=1000). */
const ORBIT_RADIUS = 1000;
/** Full-scroll orbit sweep (rad). ~49° keeps the modeled faces in view —
    beyond ~90° the diorama's blank back panel would show. */
const ORBIT_SWEEP = 0.85;
/** Full-scroll extra zoom: the camera ends 35% closer. */
const ZOOM_IN = 0.35;
/** Full-scroll camera drop toward Jozi & Bruno (world units). */
const FOCUS_DROP = 22;

/** The runtime keeps its THREE camera private; we only touch zoom on it. */
type InternalCamera = {
  zoom: number;
  updateProjectionMatrix: () => void;
};

function fitCamera(width: number, height: number) {
  const portrait = height > width;
  const short = !portrait && height < 540; // phone rotated sideways
  const widthZoom = (width * (portrait ? 0.97 : 0.8)) / SCENE_WIDTH;
  const heightZoom =
    (height * (portrait ? 0.52 : short ? 0.52 : 0.62)) / SCENE_HEIGHT;
  return {
    zoom: Math.min(widthZoom, heightZoom),
    cameraY: portrait ? 112 : short ? 96 : 128,
  };
}

export default function HeroSpline({
  stageRef,
  onProgress,
  onReady,
}: {
  stageRef: React.RefObject<HTMLElement | null>;
  onProgress: (pct: number) => void;
  onReady: () => void;
}) {
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);
  const appRef = useRef<Application | null>(null);
  const cameraRef = useRef<SPEObject | null>(null);

  // Stream the scene ourselves so the loading screen can show real progress;
  // the runtime then loads instantly from the blob we hand it.
  useEffect(() => {
    let cancelled = false;
    let blobUrl: string | null = null;
    (async () => {
      try {
        const res = await fetch(SCENE_URL);
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const total = Number(res.headers.get('content-length')) || 0;
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (total && !cancelled) {
            onProgress(Math.min(99, (received / total) * 100));
          }
        }
        if (cancelled) return;
        blobUrl = URL.createObjectURL(
          new Blob(chunks as BlobPart[], { type: 'application/octet-stream' }),
        );
        setSceneUrl(blobUrl);
      } catch {
        // fall back to letting the runtime fetch it directly
        if (!cancelled) setSceneUrl(SCENE_URL);
      }
    })();
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [onProgress]);

  // Camera driver: scroll orbit + zoom-in, pointer parallax, idle drift.
  // All values are eased every frame, so scrolling feels buttery.
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const pointer = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      pointer.x = (t.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (t.clientY / window.innerHeight) * 2 - 1;
    };
    const onTouchEnd = () => {
      pointer.x = 0;
      pointer.y = 0;
    };
    if (!reducedMotion) {
      window.addEventListener('mousemove', onMouse, { passive: true });
      window.addEventListener('touchmove', onTouch, { passive: true });
      window.addEventListener('touchstart', onTouch, { passive: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
    }

    let raf = 0;
    let theta = 0;
    let smooth = 0; // eased scroll progress
    let lastTheta = NaN;
    let lastY = NaN;
    let lastZoom = NaN;
    let last = performance.now();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const app = appRef.current;
      const cam = cameraRef.current;
      if (!app || !cam) return;

      // scroll progress across the tall hero stage
      let p = 0;
      const stage = stageRef.current;
      if (stage) {
        const rect = stage.getBoundingClientRect();
        const range = rect.height - window.innerHeight;
        if (range > 0) p = Math.min(Math.max(-rect.top / range, 0), 1);
      }
      smooth += (p - smooth) * (reducedMotion ? 1 : Math.min(dt * 5, 1));

      const parallax = reducedMotion ? 0 : pointer.x * 0.055;
      const targetTheta = smooth * ORBIT_SWEEP + parallax;
      theta += (targetTheta - theta) * (reducedMotion ? 1 : Math.min(dt * 3, 1));

      const fit = fitCamera(window.innerWidth, window.innerHeight);
      const camY =
        fit.cameraY -
        FOCUS_DROP * smooth +
        (reducedMotion ? 0 : pointer.y * -6);
      const zoom = fit.zoom * (1 + ZOOM_IN * smooth);

      // Only touch the camera when something meaningfully changed, so the
      // runtime's temporal AA can converge to a crisp frame at rest.
      // (NaN-safe: the first frame must always write.)
      const settled =
        Math.abs(theta - lastTheta) <= 1e-4 &&
        Math.abs(camY - lastY) <= 1e-2 &&
        Math.abs(zoom - lastZoom) <= 1e-4;
      if (settled) return;
      lastTheta = theta;
      lastY = camY;
      lastZoom = zoom;

      cam.position.x = ORBIT_RADIUS * Math.sin(theta);
      cam.position.z = ORBIT_RADIUS * Math.cos(theta);
      cam.position.y = camY;
      cam.rotation.y = theta;

      const three = (app as unknown as { _camera?: InternalCamera })._camera;
      if (three) {
        three.zoom = zoom;
        three.updateProjectionMatrix();
      }
      app.requestRender?.();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [stageRef]);

  if (!sceneUrl) return null;

  return (
    <Spline
      scene={sceneUrl}
      onLoad={(app: Application) => {
        appRef.current = app;
        cameraRef.current = app.findObjectByName('Camera') ?? null;
        onReady();
      }}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
