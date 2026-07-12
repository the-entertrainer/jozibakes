'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import SplineBoundary from './SplineBoundary';
import { useScenePreload } from './ScenePreloadProvider';

// The Spline runtime is a multi-MB dependency. Importing it statically would
// pull it into this page's core JS bundle — downloaded by every visitor on
// page load. Loading it via next/dynamic keeps it in its own chunk, fetched
// in parallel while the entrance gate is up rather than blocking first paint.
const Spline = dynamic(() => import('./SplineLazy'), { ssr: false });

/**
 * Mounts a Spline scene, filling its stage exactly the way Spline's own
 * React export is designed to: the component measures its container (via its
 * built-in ParentSize sizing) and renders at 100% of it — no external
 * scale/offset math on our end. `.scene-stage` decides how much space the
 * embed occupies on the page; everything inside is exactly what was authored
 * in Spline.
 *
 * Every scene mounts up front (not lazily on scroll) and stays mounted for
 * the life of the page. It registers with the preloader so the entrance gate
 * can wait for all scenes to be ready before revealing the page, and because
 * nothing is ever unmounted, scrolling between sections is instant — no
 * reload, no shimmer. See ScenePreloadProvider for the coordination.
 *
 * `fallbackSrc` is shown — in place of the 3D model, gracefully — if the
 * scene fails to load (dropped request, Spline outage, etc.), which is a real
 * risk on the flaky/metered mobile connections this site is built for. A
 * failed scene still counts as "ready" so it never holds the gate open.
 *
 * `disabled` skips Spline entirely — no mount, no network request, just the
 * fallback image. Used to isolate one scene at a time when validating exports.
 */
export default function ScrollScene({
  scene,
  fallbackSrc,
  fallbackAlt = '',
  fallbackMode = 'card',
  disabled = false,
}: {
  scene: string;
  fallbackSrc: string;
  fallbackAlt?: string;
  fallbackMode?: 'float' | 'card';
  disabled?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(disabled);
  const { registerScene, unregisterScene, reportReady } = useScenePreload();
  const idRef = useRef<number | null>(null);

  // Register with the preloader on mount; the gate counts on every scene
  // reporting back exactly once (via `settle`) whether it loads or fails.
  useEffect(() => {
    if (disabled) return;
    const id = registerScene();
    idRef.current = id;
    return () => {
      idRef.current = null;
      unregisterScene(id);
    };
  }, [disabled, registerScene, unregisterScene]);

  const settle = () => {
    if (idRef.current !== null) reportReady(idRef.current);
  };

  const onLoad = () => {
    setLoaded(true);
    settle();
  };
  const onFail = () => {
    setFailed(true);
    settle();
  };

  return (
    <div className="scene-stage">
      {!disabled && !loaded && !failed && (
        <div className="scene-loading" aria-hidden="true" />
      )}
      {!failed && !disabled && (
        <SplineBoundary onError={onFail}>
          <Spline
            scene={scene}
            onLoad={onLoad}
            className="scene-canvas"
            style={{ opacity: loaded ? 1 : 0 }}
          />
        </SplineBoundary>
      )}
      {failed && (
        <img
          src={fallbackSrc}
          alt={fallbackAlt}
          loading="lazy"
          className={`scene-fallback scene-fallback--${fallbackMode}`}
        />
      )}
    </div>
  );
}
