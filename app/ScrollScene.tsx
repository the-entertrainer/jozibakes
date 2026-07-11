'use client';

import Spline from '@splinetool/react-spline';
import { useEffect, useRef, useState } from 'react';

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
 */
export default function ScrollScene({
  scene,
  sizePct = 200,
  offsetXPct = 0,
  offsetYPct = 0,
  mobileOffsetYPct = 0,
}: {
  scene: string;
  sizePct?: number;
  offsetXPct?: number;
  offsetYPct?: number;
  mobileOffsetYPct?: number;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Lazy-mount the runtime only when the section is near the viewport.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMount(true);
          io.disconnect();
        }
      },
      { rootMargin: '700px 0px' },
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
      <div
        ref={inner}
        className="scene-inner"
        style={{ opacity: loaded ? 1 : 0, ['--size' as string]: `${sizePct}%` }}
      >
        {mount && <Spline scene={scene} onLoad={() => setLoaded(true)} />}
      </div>
    </div>
  );
}
