'use client';

import Spline from '@splinetool/react-spline';
import { useEffect, useRef, useState } from 'react';
import SplineBoundary from './SplineBoundary';

/**
 * Places a Spline object in its section.
 *
 * This component only mounts, sizes and positions the scene — all motion is
 * authored inside Spline itself. It lazy-mounts the runtime near the viewport
 * and fades the scene in once it's ready.
 *
 * `sizePct` scales the canvas relative to its stage (rendered crisp, not
 * upscaled); `offsetXPct` / `offsetYPct` nudge the model so it overlaps
 * neighbouring copy on desktop, `mobileOffsetYPct` does the same on mobile.
 *
 * `fallbackSrc` is shown — in place of the 3D model, gracefully — if the
 * scene fails to load (dropped request, Spline outage, etc.), which is a
 * real risk on the flaky/metered mobile connections this site is built for.
 */
export default function ScrollScene({
  scene,
  sizePct = 200,
  offsetXPct = 0,
  offsetYPct = 0,
  mobileOffsetYPct = 0,
  fallbackSrc,
  fallbackAlt = '',
  fallbackMode = 'card',
}: {
  scene: string;
  sizePct?: number;
  offsetXPct?: number;
  offsetYPct?: number;
  mobileOffsetYPct?: number;
  fallbackSrc: string;
  fallbackAlt?: string;
  fallbackMode?: 'float' | 'card';
}) {
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Lazy-mount the runtime near the viewport, and unmount it again once the
  // section is well out of view. Each mounted scene is its own WebGL
  // context — with 4 of these on the page, letting them all accumulate as
  // the user scrolls past is unnecessary GPU/battery load on phones, which
  // is most of our traffic. The motion inside each scene is self-contained
  // (not driven by page scroll position, unlike the hero), so unmounting
  // and remounting is a clean, harmless reset — worst case a returning
  // visitor sees the loading shimmer again for a moment.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const intersecting = entries[0].isIntersecting;
        setMount(intersecting);
        if (!intersecting) {
          setLoaded(false);
          setFailed(false);
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Static placement — computed once and on resize, no scroll animation.
  useEffect(() => {
    const place = () => {
      const el = stage.current;
      const box = inner.current;
      if (!el || !box) return;
      const r = el.getBoundingClientRect();
      const isMobile = window.innerWidth <= 780;
      const ox = isMobile ? 0 : (offsetXPct / 100) * r.width;
      const oyPct = isMobile ? mobileOffsetYPct : offsetYPct;
      const oy = (oyPct / 100) * r.height;
      box.style.transform = `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`;
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [offsetXPct, offsetYPct, mobileOffsetYPct, loaded]);

  return (
    <div ref={stage} className="scene-stage">
      {mount && !loaded && !failed && (
        <div className="scene-loading" aria-hidden="true" />
      )}
      <div
        ref={inner}
        className="scene-inner"
        style={{ opacity: loaded ? 1 : 0, ['--size' as string]: `${sizePct}%` }}
      >
        {mount && !failed && (
          <SplineBoundary onError={() => setFailed(true)}>
            <Spline scene={scene} onLoad={() => setLoaded(true)} />
          </SplineBoundary>
        )}
      </div>
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
