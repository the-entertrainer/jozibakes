'use client';

import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';
import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-driven Spline stage.
 *
 * As the section travels through the viewport we compute a progress value
 * `p` (0 = just entering at the bottom, 0.5 = centred, 1 = leaving at the
 * top) and feed it to the scene's exposed Number variables, plus a gentle
 * CSS parallax on the canvas so the model drifts relative to the text.
 *
 * `sizePct` scales the canvas relative to its stage (rendered crisp, not
 * upscaled) and `offsetXPct` pushes the model sideways so it can overlap
 * neighbouring copy on desktop. Presets keep the drive logic serialisable
 * so the section markup can stay in a server component.
 */
type Drive = (p: number) => Record<string, number>;

const DRIVES: Record<string, Drive> = {
  // Sweet Treats — pink sprinkle donut.
  // Baseline tilt keeps a stylish 3/4 pose at every scroll position;
  // spin and float layer motion on top.
  treats: (p) => ({
    spinY: 24 + p * 360,
    tilt: 22 + 8 * Math.sin(p * Math.PI),
    bob: 20 * Math.sin(p * Math.PI),
  }),
};

export default function ScrollScene({
  scene,
  preset,
  parallax = 42,
  sizePct = 200,
  offsetXPct = 0,
  offsetYPct = 0,
  mobileOffsetYPct = 0,
}: {
  scene: string;
  preset: keyof typeof DRIVES | string;
  parallax?: number;
  /** Canvas size as a % of the stage. Bigger = larger, still crisp. */
  sizePct?: number;
  /** Horizontal push of the model, as a % of stage width (desktop only). */
  offsetXPct?: number;
  /** Vertical push of the model, as a % of stage height (desktop only). */
  offsetYPct?: number;
  /** Vertical push on mobile (stacked layout), as a % of stage height. */
  mobileOffsetYPct?: number;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const app = useRef<Application | null>(null);
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

  // Drive variables + parallax from scroll position.
  useEffect(() => {
    const drive = DRIVES[preset] ?? DRIVES.treats;
    let ticking = false;
    const update = () => {
      ticking = false;
      const el = stage.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = r.top + r.height / 2;
      const p = Math.max(0, Math.min(1, 1 - center / vh));
      const vars = drive(p);
      const a = app.current;
      if (a) {
        for (const k in vars) {
          try {
            a.setVariable(k, vars[k]);
          } catch {
            /* variable not present in scene */
          }
        }
      }
      if (inner.current) {
        const isMobile = window.innerWidth <= 780;
        const ox = isMobile ? 0 : (offsetXPct / 100) * r.width;
        const oyPct = isMobile ? mobileOffsetYPct : offsetYPct;
        const oy = (oyPct / 100) * r.height;
        const py = oy + (0.5 - p) * parallax;
        inner.current.style.transform = `translate(calc(-50% + ${ox}px), calc(-50% + ${py}px))`;
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [preset, parallax, offsetXPct, offsetYPct, mobileOffsetYPct, loaded]);

  return (
    <div ref={stage} className="scene-stage">
      <div
        ref={inner}
        className="scene-inner"
        style={{ opacity: loaded ? 1 : 0, ['--size' as string]: `${sizePct}%` }}
      >
        {mount && (
          <Spline
            scene={scene}
            onLoad={(a: Application) => {
              app.current = a;
              setLoaded(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
