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

function smoothstep(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// Poses are built from where the section sits in the viewport:
//   c = 1 at centre, 0 at the edges  → how "settled" the model is
//   s = -1 entering (bottom) → +1 leaving (top)  → travel direction
// So the model turns *through* its hero angle and tips up to reveal its top
// as it settles at centre, then reverses out — a scroll-scrubbed entrance/exit.
const fullSpin: Drive = (p) => {
  const c = 1 - Math.min(1, Math.abs(p - 0.5) * 2);
  const s = (p - 0.5) * 2;
  return {
    spinY: 20 + s * 150,
    tilt: 10 + 26 * c,
    bob: 26 * c,
  };
};

const DRIVES: Record<string, Drive> = {
  // Sweet Treats — pink sprinkle donut
  treats: fullSpin,
  // Breads — basket of loaves
  breads: fullSpin,
  // Loaf Cakes — strawberry-topped cake slice
  loaf: fullSpin,
  // Cookies — a flat disc, so it only turns gently (a full spin would show its
  // thin edge) but tips strongly face-on to reveal the chips at centre.
  cookies: (p) => {
    const c = 1 - Math.min(1, Math.abs(p - 0.5) * 2);
    const s = (p - 0.5) * 2;
    return {
      spinY: 24 + s * 30,
      tilt: 8 + 30 * c,
      bob: 22 * c,
    };
  },
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
        // Entrance/exit envelope: fade + scale up + rise in as the section
        // enters, hold while it's on screen, reverse as it leaves.
        const reveal =
          smoothstep(0.03, 0.3, p) * (1 - smoothstep(0.7, 0.97, p));
        const scale = 0.6 + 0.4 * reveal;
        const revealY = (1 - reveal) * 48;
        const py = oy + (0.5 - p) * parallax + revealY;
        inner.current.style.transform = `translate(calc(-50% + ${ox}px), calc(-50% + ${py}px)) scale(${scale})`;
        inner.current.style.opacity = String(loaded ? reveal : 0);
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
        style={{ opacity: 0, ['--size' as string]: `${sizePct}%` }}
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
