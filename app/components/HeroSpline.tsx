'use client';

import { useEffect, useRef, useState } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application, SPEObject } from '@splinetool/runtime';

const SCENE_URL = 'https://prod.spline.design/Le2iIYYasafjz8Ib/scene.splinecode';

/**
 * Approximate world-unit footprint of the whole diorama (shop + trees) and
 * Jozi & Bruno's world positions — from the current Spline export (Shop
 * scale 4, Jozi scale 100 @ x=0, Bruno scale 70 @ x=34.04). These scale with
 * the scene, so re-derive them (via screenshots) if the scene is re-exported
 * at a different scale again.
 */
const SCENE_WIDTH = 706;
const SCENE_HEIGHT = 565;

const JOZI_X = 0;
const BRUNO_X = 34.04;
/** Midpoint between Jozi & Bruno — the close-up pan target on portrait. */
const CLOSE_TARGET_X_PORTRAIT = (JOZI_X + BRUNO_X) / 2;
/** Close-up camera height on portrait, biased up toward faces/torsos. */
const CLOSE_CAMERA_Y_PORTRAIT = 105;
/** How much closer the portrait close-up zoom is vs. the wide fit. */
const CLOSE_ZOOM_MULTIPLIER_PORTRAIT = 4.2;

/**
 * Landscape's height-bound wide zoom (see fitCamera) is already much higher
 * than portrait's width-bound one, so the same zoom multiplier and pan
 * distance wildly overshoot on desktop — found empirically by polling the
 * live camera/zoom directly in the browser (not derivable from the wide
 * framing's math). Re-derive these three via the same technique if the
 * scene is re-exported at a different scale.
 */
const CLOSE_TARGET_X_LANDSCAPE = 430;
const CLOSE_CAMERA_Y_LANDSCAPE = 140;
const CLOSE_ZOOM_LANDSCAPE = 3.5;

/** Renderer/pixel-ratio internals the runtime keeps private but exposes at runtime. */
type InternalRenderer = { setPixelRatio: (ratio: number) => void };
type InternalCamera = { zoom: number; updateProjectionMatrix: () => void };
type InternalApp = Application & {
  _renderer?: InternalRenderer;
  _resize?: () => void;
  _camera?: InternalCamera;
};

/** Cap device pixel ratio for crispness vs. GPU load on an animated scene. */
const MAX_PIXEL_RATIO = 2;

function fitCamera(width: number, height: number) {
  const portrait = height > width;
  const short = !portrait && height < 540; // phone rotated sideways
  const widthZoom = (width * (portrait ? 0.97 : 0.8)) / SCENE_WIDTH;
  const heightZoom =
    (height * (portrait ? 0.52 : short ? 0.52 : 0.62)) / SCENE_HEIGHT;
  return {
    zoom: Math.min(widthZoom, heightZoom),
    cameraY: portrait ? 264 : short ? 226 : 301,
    closeTargetX: portrait ? CLOSE_TARGET_X_PORTRAIT : CLOSE_TARGET_X_LANDSCAPE,
    closeCameraY: portrait ? CLOSE_CAMERA_Y_PORTRAIT : CLOSE_CAMERA_Y_LANDSCAPE,
    closeZoom: portrait
      ? Math.min(widthZoom, heightZoom) * CLOSE_ZOOM_MULTIPLIER_PORTRAIT
      : CLOSE_ZOOM_LANDSCAPE,
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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
  const appRef = useRef<InternalApp | null>(null);
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

  // Camera driver: scroll pans + zooms the camera in toward Jozi & Bruno
  // (no rotation/orbit — same front-on angle throughout), plus a subtle
  // pointer/touch parallax offset. All values are eased every frame.
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
    let smooth = 0; // eased scroll progress
    let lastX = NaN;
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

      const fit = fitCamera(window.innerWidth, window.innerHeight);
      const parallaxX = reducedMotion ? 0 : pointer.x * 14;
      const parallaxY = reducedMotion ? 0 : pointer.y * -9;

      const camX = lerp(0, fit.closeTargetX, smooth) + parallaxX;
      const camY = lerp(fit.cameraY, fit.closeCameraY, smooth) + parallaxY;
      const zoom = lerp(fit.zoom, fit.closeZoom, smooth);

      // Only touch the camera when something meaningfully changed, so the
      // runtime's temporal AA can converge to a crisp frame at rest.
      // (NaN-safe: the first frame must always write.)
      const settled =
        Math.abs(camX - lastX) <= 1e-3 &&
        Math.abs(camY - lastY) <= 1e-3 &&
        Math.abs(zoom - lastZoom) <= 1e-4;
      if (settled) return;
      lastX = camX;
      lastY = camY;
      lastZoom = zoom;

      cam.position.x = camX;
      cam.position.y = camY;

      const three = app._camera;
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
        const internal = app as InternalApp;
        appRef.current = internal;
        cameraRef.current = app.findObjectByName('Camera') ?? null;

        // The scene's Spline publish settings bake in a low mobile pixel
        // ratio (a fixed low-res buffer stretched to fill the screen),
        // which reads as pixelated on phones. Override it after load, then
        // force a resize so the drawing buffer is actually reallocated at
        // the new ratio (setPixelRatio alone doesn't reallocate it) — this
        // sticks across future resizes/orientation changes since _resize()
        // never re-touches pixel ratio itself.
        internal._renderer?.setPixelRatio(
          Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO),
        );
        internal._resize?.();

        onReady();
      }}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
