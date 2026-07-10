'use client';

import { useEffect, useRef, useState } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application, SPEObject } from '@splinetool/runtime';
import { STATIONS } from '../data/stations';

const SCENE_URL = 'https://prod.spline.design/Le2iIYYasafjz8Ib/scene.splinecode';

/**
 * Approximate world-unit footprint of the whole diorama (from the current
 * Spline export: Shop scale 4, Jozi scale 100 @ x=0, Bruno scale 70 @
 * x=34.04). Used to fit the isometric zoom. Re-derive via screenshots if the
 * scene is re-exported at a different scale.
 */
const SCENE_WIDTH = 706;
const SCENE_HEIGHT = 565;

/**
 * Isometric framing. The camera orbits the vertical axis through the scene
 * origin (x = 0, z = 0) at its authored XZ distance, turned by an azimuth
 * offset into a 3/4 diorama view. Deliberately azimuth-only (Y-axis
 * rotation): the authored camera's own pitch (rotation.x, baked in by the
 * scene's designer) is never touched, since only ever driving position +
 * a single rotation axis is the pattern already proven to render correctly
 * with this runtime — recomputing full orientation via lookAt() and
 * mirroring it back fought the runtime's own camera sync and rendered
 * blank/off-frame. Re-tune ISO_AZIM_REST against screenshots if the scene
 * is re-exported.
 */
const ISO_AZIM_REST = 0.72; // ~41° turn

/** How far drag can swing the azimuth before it eases back to rest. */
const AZIM_CLAMP = 0.38; // ~22°
const DRAG_AZIM_SPEED = 0.0042;
const DRAG_RETURN = 0.94; // per-frame decay of drag back toward the rest pose

/** Slow breathing sway so the resting diorama still feels alive. */
const IDLE_SWAY_AMP = 0.04;
const IDLE_SWAY_OMEGA = (2 * Math.PI) / 22;

const DRAG_THRESHOLD_PX = 6;
const FALLBACK_RADIUS_XZ = 1467;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Overview zoom + camera height per orientation — the same tuned values the
 * front-on version validated by screenshot, reused as-is since the
 * authored pitch (and therefore what height "frames well") hasn't changed.
 */
function fitCamera(width: number, height: number) {
  const portrait = height > width;
  const short = !portrait && height < 540;
  const widthZoom = (width * (portrait ? 0.92 : 0.8)) / SCENE_WIDTH;
  const heightZoom = (height * (portrait ? 0.5 : short ? 0.5 : 0.6)) / SCENE_HEIGHT;
  return {
    zoom: Math.min(widthZoom, heightZoom),
    cameraY: portrait ? 264 : short ? 226 : 301,
  };
}

/** Renderer/camera internals the runtime keeps private but exposes at runtime. */
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

/** Manual THREE.Vector3.project() — world → screen px. */
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

  const ndcX = cx / (cw || 1);
  const ndcY = cy / (cw || 1);
  return {
    x: (ndcX * 0.5 + 0.5) * width,
    y: (1 - (ndcY * 0.5 + 0.5)) * height,
  };
}

export default function HeroSpline({
  activeStationId,
  onSelectStation,
  onBackgroundTap,
  onProgress,
  onReady,
}: {
  activeStationId: string | null;
  onSelectStation: (id: string) => void;
  onBackgroundTap: () => void;
  onProgress: (pct: number) => void;
  onReady: () => void;
}) {
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);
  const appRef = useRef<InternalApp | null>(null);
  const cameraRef = useRef<SPEObject | null>(null);
  const homeRef = useRef<{ radiusXZ: number; headingY: number } | null>(null);
  const markerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const activeRef = useRef(activeStationId);
  activeRef.current = activeStationId;

  // Stream the scene ourselves so the loader can show real progress; the
  // runtime then loads instantly from the blob we hand it.
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
          if (total && !cancelled) onProgress(Math.min(99, (received / total) * 100));
        }
        if (cancelled) return;
        blobUrl = URL.createObjectURL(
          new Blob(chunks as BlobPart[], { type: 'application/octet-stream' }),
        );
        setSceneUrl(blobUrl);
      } catch {
        if (!cancelled) setSceneUrl(SCENE_URL);
      }
    })();
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [onProgress]);

  // Camera driver + hotspot projection: orbits the diorama azimuth-only
  // (position + cam.rotation.y — see ISO_AZIM_REST above for why), eases to
  // a station close-up on selection, and imperatively positions the hotspot
  // markers each frame so there is no per-frame React state churn.
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Drag-to-orbit state (screen-space), eased into the pose each frame.
    let pointerDown = false;
    let dragged = false;
    let startX = 0;
    let baseAzim = 0;
    let targetAzim = 0;
    let azim = 0;

    const surface = rootRef.current?.querySelector<HTMLElement>('[data-drag-surface]');
    const onDown = (e: PointerEvent) => {
      pointerDown = true;
      dragged = false;
      startX = e.clientX;
      baseAzim = targetAzim;
      surface?.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!pointerDown || reducedMotion) return;
      const dx = e.clientX - startX;
      if (!dragged && Math.abs(dx) > DRAG_THRESHOLD_PX) dragged = true;
      if (!dragged) return;
      // Only orbit while looking at the whole diorama, not during a close-up.
      if (activeRef.current) return;
      targetAzim = Math.max(-AZIM_CLAMP, Math.min(AZIM_CLAMP, baseAzim + dx * DRAG_AZIM_SPEED));
    };
    const onUp = (e: PointerEvent) => {
      if (pointerDown && !dragged) onBackgroundTap();
      pointerDown = false;
      surface?.releasePointerCapture?.(e.pointerId);
    };
    surface?.addEventListener('pointerdown', onDown);
    surface?.addEventListener('pointermove', onMove);
    surface?.addEventListener('pointerup', onUp);
    surface?.addEventListener('pointercancel', onUp);

    let raf = 0;
    let focus = 0; // eased 0 (overview) -> 1 (station close-up)
    let swayT = 0;
    let lastActiveAnchor = STATIONS[0].anchor;
    let lastFocusZoom = STATIONS[0].focusZoom;
    let last = performance.now();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const app = appRef.current;
      const three = app?._camera;
      const cam = cameraRef.current;
      const home = homeRef.current;
      if (!app || !three || !cam || !home) return;

      const activeId = activeRef.current;
      const station = activeId ? STATIONS.find((s) => s.id === activeId) : null;
      if (station) {
        lastActiveAnchor = station.anchor;
        lastFocusZoom = station.focusZoom;
      }

      const focusTarget = station ? 1 : 0;
      focus += (focusTarget - focus) * (reducedMotion ? 1 : Math.min(dt * 4, 1));

      // Ease drag toward the rest pose when the finger is up; add idle sway.
      if (!pointerDown) targetAzim *= DRAG_RETURN;
      azim += (targetAzim - azim) * Math.min(dt * 8, 1);
      swayT += dt;
      const sway = reducedMotion ? 0 : IDLE_SWAY_AMP * Math.sin(swayT * IDLE_SWAY_OMEGA);

      // Azimuth eases back to front-on (0) while focusing on a station, so
      // the close-up presents it straight-on rather than at the iso angle.
      const overview = 1 - focus;
      const A = home.headingY + (ISO_AZIM_REST + azim + sway) * overview;

      const fit = fitCamera(window.innerWidth, window.innerHeight);
      const zoom = lerp(fit.zoom, fit.zoom * lastFocusZoom, focus);
      // Camera height eases from the overview height down toward the active
      // station's anchor (a little above it, roughly head height) on focus.
      const camY = lerp(fit.cameraY, lastActiveAnchor.y + 40, focus);

      // Orbit the vertical axis through the scene origin at the authored XZ
      // radius (azimuth-only — pitch stays whatever the scene authored on
      // `cam.rotation.x`, never touched here), nudged toward the active
      // station's X on focus so the close-up centres on it.
      const camX = home.radiusXZ * Math.sin(A) + lerp(0, lastActiveAnchor.x, focus);
      const camZ = home.radiusXZ * Math.cos(A);

      cam.position.x = camX;
      cam.position.y = camY;
      cam.position.z = camZ;
      cam.rotation.y = A;

      three.zoom = zoom;
      three.updateProjectionMatrix();
      three.updateMatrixWorld(true);

      // Position hotspot markers imperatively; fade + disable them in close-up.
      const w = window.innerWidth;
      const h = window.innerHeight;
      const markerOpacity = Math.max(0, 1 - focus * 1.6);
      for (let i = 0; i < STATIONS.length; i++) {
        const el = markerRefs.current[i];
        if (!el) continue;
        const a = STATIONS[i].anchor;
        const p = projectToScreen(a.x, a.y, a.z, three, w, h);
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
        el.style.opacity = `${markerOpacity}`;
        el.style.pointerEvents = markerOpacity > 0.5 ? 'auto' : 'none';
      }

      app.requestRender?.();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      surface?.removeEventListener('pointerdown', onDown);
      surface?.removeEventListener('pointermove', onMove);
      surface?.removeEventListener('pointerup', onUp);
      surface?.removeEventListener('pointercancel', onUp);
    };
  }, [onBackgroundTap]);

  if (!sceneUrl) return null;

  return (
    <div ref={rootRef} className="absolute inset-0">
      <div className="pointer-events-none absolute inset-0">
        <Spline
          scene={sceneUrl}
          onLoad={(app: Application) => {
            const internal = app as InternalApp;
            appRef.current = internal;
            const camObj = app.findObjectByName('Camera') ?? null;
            cameraRef.current = camObj;

            // Authored camera's XZ distance from the scene origin (the orbit
            // radius) and its starting yaw — orbiting around that origin at
            // this exact radius reproduces the authored, known-good framing
            // at azimuth 0, so any rotation away from it is a pure Y-turn of
            // a already-correct pose rather than a freshly computed one.
            if (camObj) {
              homeRef.current = {
                radiusXZ: Math.hypot(camObj.position.x, camObj.position.z) || FALLBACK_RADIUS_XZ,
                headingY: camObj.rotation.y,
              };
            } else {
              homeRef.current = { radiusXZ: FALLBACK_RADIUS_XZ, headingY: 0 };
            }

            // Override Spline's baked low mobile pixel ratio (a fixed low-res
            // buffer stretched to fill the screen — the "cheap"/pixelated
            // look) with the real device ratio, then force a resize so the
            // drawing buffer is actually reallocated crisp.
            internal._renderer?.setPixelRatio(
              Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO),
            );
            internal._resize?.();

            // Dev aid (gated by ?debug): dump scene object names + world
            // positions so station anchors can be tuned against the real
            // export, and expose the app for console poking.
            if (
              typeof window !== 'undefined' &&
              new URLSearchParams(window.location.search).has('debug')
            ) {
              (window as unknown as { __spline?: unknown }).__spline = internal;
              try {
                const dump = app.getAllObjects().map((o) => ({
                  name: o.name,
                  x: Math.round(o.position.x),
                  y: Math.round(o.position.y),
                  z: Math.round(o.position.z),
                }));
                console.log('SPLINE_OBJECTS', JSON.stringify(dump));
              } catch {
                /* ignore */
              }
            }

            onReady();
          }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* drag-to-orbit surface (also taps-to-dismiss when zoomed in) */}
      <div data-drag-surface className="absolute inset-0 z-10 touch-none" style={{ cursor: 'grab' }} />

      {/* hotspot markers, positioned imperatively by the RAF loop */}
      <div className="pointer-events-none absolute inset-0 z-30">
        {STATIONS.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => {
              markerRefs.current[i] = el;
            }}
            type="button"
            aria-label={s.label}
            onClick={(e) => {
              e.stopPropagation();
              onSelectStation(s.id);
            }}
            className="hotspot absolute top-0 left-0"
            style={{ opacity: 0 }}
          >
            <span className="hotspot-ring" aria-hidden="true" />
            <span className="hotspot-dot" aria-hidden="true" />
            <span className="hotspot-label">
              <span aria-hidden="true">{s.emoji}</span> {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
