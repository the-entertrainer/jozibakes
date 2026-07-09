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
/**
 * A point near Jozi's head/shoulder (world space) — the menu's anchor.
 * Portrait's menu sits below her (needs the anchor a bit higher, at her
 * hat, so the menu clears her whole body); landscape's sits beside her at
 * shoulder height. Tuned per aspect ratio like the camera framing itself.
 */
const JOZI_ANCHOR_Y_PORTRAIT = 120;
const JOZI_ANCHOR_Y_LANDSCAPE = 92;
const JOZI_ANCHOR_Z = 212.2;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * "Engaged" framing: a subtle push toward Jozi & Bruno on tap — not the
 * dramatic close-up the old scroll version used. Rather than pick new
 * numbers from scratch, this is a fixed ~40% step along the *same* wide →
 * full-close-up path that was already validated screenshot-by-screenshot
 * (old CLOSE_* constants), so pan/zoom/height stay proportionally
 * consistent instead of drifting independently. Re-derive ENGAGE_T (and
 * the full-close targets it interpolates toward) via screenshots if the
 * scene is re-exported at a different scale.
 */
const ENGAGE_T = 0.7;
const FULL_CLOSE_TARGET_X_PORTRAIT = 17.02;
const FULL_CLOSE_CAMERA_Y_PORTRAIT = 105;
const FULL_CLOSE_ZOOM_MULTIPLIER_PORTRAIT = 4.2;
const ENGAGED_TARGET_X_PORTRAIT = lerp(0, FULL_CLOSE_TARGET_X_PORTRAIT, ENGAGE_T);
const ENGAGED_CAMERA_Y_PORTRAIT = lerp(264, FULL_CLOSE_CAMERA_Y_PORTRAIT, ENGAGE_T);
const ENGAGED_ZOOM_MULTIPLIER_PORTRAIT = lerp(1, FULL_CLOSE_ZOOM_MULTIPLIER_PORTRAIT, ENGAGE_T);

const FULL_CLOSE_TARGET_X_LANDSCAPE = 430;
const FULL_CLOSE_CAMERA_Y_LANDSCAPE = 140;
/** Landscape's full-close zoom was an empirically-found absolute value, not
    a multiplier (see the earlier framing investigation), so the engaged
    zoom below is derived dynamically per-viewport inside fitCamera(). */
const FULL_CLOSE_ZOOM_LANDSCAPE = 3.5;
const ENGAGED_TARGET_X_LANDSCAPE = lerp(0, FULL_CLOSE_TARGET_X_LANDSCAPE, ENGAGE_T);
const ENGAGED_CAMERA_Y_LANDSCAPE = lerp(301, FULL_CLOSE_CAMERA_Y_LANDSCAPE, ENGAGE_T);

/** Renderer/pixel-ratio/projection internals the runtime keeps private but exposes at runtime. */
type InternalRenderer = { setPixelRatio: (ratio: number) => void };
type Matrix4Like = { elements: number[] };
type InternalCamera = {
  zoom: number;
  updateProjectionMatrix: () => void;
  updateMatrixWorld: (force?: boolean) => void;
  matrixWorldInverse: Matrix4Like;
  projectionMatrix: Matrix4Like;
};
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
  const zoom = Math.min(widthZoom, heightZoom);
  return {
    zoom,
    cameraY: portrait ? 264 : short ? 226 : 301,
    engagedTargetX: portrait ? ENGAGED_TARGET_X_PORTRAIT : ENGAGED_TARGET_X_LANDSCAPE,
    engagedCameraY: portrait ? ENGAGED_CAMERA_Y_PORTRAIT : ENGAGED_CAMERA_Y_LANDSCAPE,
    engagedZoom: portrait
      ? zoom * ENGAGED_ZOOM_MULTIPLIER_PORTRAIT
      : lerp(zoom, FULL_CLOSE_ZOOM_LANDSCAPE, ENGAGE_T),
  };
}

/** Manual re-implementation of THREE.Vector3.project() — world → screen px. */
function projectToScreen(
  worldX: number,
  worldY: number,
  worldZ: number,
  camera: InternalCamera,
  width: number,
  height: number,
) {
  const v = camera.matrixWorldInverse.elements;
  const vx = v[0] * worldX + v[4] * worldY + v[8] * worldZ + v[12];
  const vy = v[1] * worldX + v[5] * worldY + v[9] * worldZ + v[13];
  const vz = v[2] * worldX + v[6] * worldY + v[10] * worldZ + v[14];

  const p = camera.projectionMatrix.elements;
  const cx = p[0] * vx + p[4] * vy + p[8] * vz + p[12];
  const cy = p[1] * vx + p[5] * vy + p[9] * vz + p[13];
  const cw = p[3] * vx + p[7] * vy + p[11] * vz + p[15];

  const ndcX = cx / cw;
  const ndcY = cy / cw;
  return {
    x: (ndcX * 0.5 + 0.5) * width,
    y: (1 - (ndcY * 0.5 + 0.5)) * height,
  };
}

export default function HeroSpline({
  engaged,
  onJoziScreen,
  onProgress,
  onReady,
}: {
  engaged: boolean;
  onJoziScreen: (pos: { x: number; y: number } | null) => void;
  onProgress: (pct: number) => void;
  onReady: () => void;
}) {
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);
  const appRef = useRef<InternalApp | null>(null);
  const cameraRef = useRef<SPEObject | null>(null);
  const engagedRef = useRef(engaged);
  engagedRef.current = engaged;

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

  // Camera driver: eases toward a subtle "engaged" framing on tap (no
  // rotation/orbit — same front-on angle throughout), plus a gentle
  // pointer/touch parallax offset. Reports Jozi's projected screen position
  // each time the camera actually changes, so the RPG menu can track her.
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
    let smooth = 0; // eased 0 (wide) -> 1 (engaged)
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

      const target = engagedRef.current ? 1 : 0;
      smooth += (target - smooth) * (reducedMotion ? 1 : Math.min(dt * 4, 1));

      const fit = fitCamera(window.innerWidth, window.innerHeight);
      const parallaxX = reducedMotion ? 0 : pointer.x * 8;
      const parallaxY = reducedMotion ? 0 : pointer.y * -5;

      const camX = lerp(JOZI_X, fit.engagedTargetX, smooth) + parallaxX;
      const camY = lerp(fit.cameraY, fit.engagedCameraY, smooth) + parallaxY;
      const zoom = lerp(fit.zoom, fit.engagedZoom, smooth);

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
        three.updateMatrixWorld(true);
        const anchorY =
          window.innerHeight > window.innerWidth
            ? JOZI_ANCHOR_Y_PORTRAIT
            : JOZI_ANCHOR_Y_LANDSCAPE;
        onJoziScreen(
          projectToScreen(
            JOZI_X,
            anchorY,
            JOZI_ANCHOR_Z,
            three,
            window.innerWidth,
            window.innerHeight,
          ),
        );
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
  }, [onJoziScreen]);

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
