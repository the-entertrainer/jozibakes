'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import SplineBoundary from './SplineBoundary';

// The Spline runtime is a multi-MB dependency. Importing it statically would
// pull it into this page's core JS bundle — downloaded by every visitor on
// page load, even ones who never scroll far enough to see one of these
// scenes. Loading it via next/dynamic means the chunk is only fetched the
// moment this component actually renders a <Spline>, which — because that's
// itself gated behind the `mount` IntersectionObserver below — only happens
// once the section is genuinely about to come into view.
const Spline = dynamic(() => import('./SplineLazy'), { ssr: false });

/**
 * Mounts a Spline scene, filling its stage exactly the way Spline's own
 * React export is designed to: the component measures its container (via
 * its built-in ParentSize sizing) and renders at 100% of it — no external
 * scale/offset math on our end. `.scene-stage` decides how much space the
 * embed occupies on the page (an ordinary layout decision); everything
 * inside that box is exactly what was authored in Spline.
 *
 * `fallbackSrc` is shown — in place of the 3D model, gracefully — if the
 * scene fails to load (dropped request, Spline outage, etc.), which is a
 * real risk on the flaky/metered mobile connections this site is built for.
 *
 * `disabled` skips Spline entirely — no mount, no network request, just
 * the fallback image from the start. Used to isolate one scene at a time
 * while validating new Spline exports one by one.
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
  const stage = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(disabled);

  // Lazy-mount the runtime near the viewport, and unmount it again once the
  // section is well out of view. Each mounted scene is its own WebGL
  // context — with several of these on the page, letting them all
  // accumulate as the user scrolls past is unnecessary GPU/battery load on
  // phones, which is most of our traffic. The motion inside each scene is
  // self-contained (not driven by page scroll position, unlike the hero),
  // so unmounting and remounting is a clean, harmless reset — worst case a
  // returning visitor sees the loading shimmer again for a moment.
  useEffect(() => {
    if (disabled) return; // never mounts Spline, so nothing to observe
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
  }, [disabled]);

  return (
    <div ref={stage} className="scene-stage">
      {mount && !loaded && !failed && (
        <div className="scene-loading" aria-hidden="true" />
      )}
      {mount && !failed && (
        <SplineBoundary onError={() => setFailed(true)}>
          <Spline
            scene={scene}
            onLoad={() => setLoaded(true)}
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
