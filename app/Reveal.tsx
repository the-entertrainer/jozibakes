'use client';

import { useEffect, useRef } from 'react';
import type { ElementType, ReactNode } from 'react';

/**
 * Cinematic scroll-reveal wrapper.
 *
 * Elements start hidden (offset + faded) and settle into place the moment
 * they cross into view, once, like a scene cutting into frame.
 *
 * Driven by a single shared scroll/resize listener + rAF loop (the same
 * pattern already used by ScrollProgress and the photo carousel) rather
 * than IntersectionObserver — under heavy sustained WebGL work from the
 * Spline scenes, IntersectionObserver notifications can be starved for
 * long stretches on some GPU/driver combinations, silently leaving content
 * hidden. A directly-polled rect check has no such failure mode.
 *
 * Purely presentational — no scroll-scrubbing, no dependency on the Spline
 * objects. `prefers-reduced-motion` collapses it to a plain fade.
 */
type Variant = 'up' | 'fade' | 'clip' | 'scale';

const pending = new Set<HTMLElement>();
let ticking = false;
let listenersBound = false;

function checkAll() {
  ticking = false;
  const vh = window.innerHeight || 1;
  for (const el of pending) {
    const r = el.getBoundingClientRect();
    // Reveal once the element has crept into the bottom ~90% of the
    // viewport — roughly equivalent to the old IntersectionObserver's
    // threshold/rootMargin, so the motion still reads as "just arriving".
    if (r.top < vh * 0.92 && r.bottom > 0) {
      el.classList.add('is-in');
      pending.delete(el);
    }
  }
}

function schedule() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(checkAll);
  }
}

function bindListeners() {
  if (listenersBound) return;
  listenersBound = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
}

export default function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  className = '',
  children,
}: {
  as?: ElementType;
  variant?: Variant;
  /** ms, for staggering a group of Reveals entering together */
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current as HTMLElement | null;
    if (!el) return;
    bindListeners();
    pending.add(el);
    schedule(); // catches elements already in view on mount (e.g. the hero)
    return () => {
      pending.delete(el);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${variant} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
