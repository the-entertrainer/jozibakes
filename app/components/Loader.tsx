'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

/**
 * Branded loading screen shown while the ~20 MB Spline scene streams in.
 * Cream backdrop, maroon wordmark, real progress, then a soft fade-out.
 */
export default function Loader() {
  const { progress, active } = useProgress();
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100) {
      // small grace period so the scene's first frame is already painted
      const t1 = setTimeout(() => setDone(true), 350);
      const t2 = setTimeout(() => setGone(true), 1350);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [active, progress]);

  if (gone) return null;

  const pct = Math.min(100, Math.round(progress));

  return (
    <div
      aria-hidden={done}
      role="status"
      aria-label="Loading the bakery"
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center gap-7 bg-cream-warm transition-opacity duration-700 ease-out ${
        done ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* whisk-and-heart mark */}
      <div className="animate-float">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path
            d="M32 54c-9-7.5-18-14.6-18-24a10.4 10.4 0 0 1 18-7.1A10.4 10.4 0 0 1 50 30c0 9.4-9 16.5-18 24Z"
            fill="#8B2E1F"
            opacity="0.92"
          />
          <path
            d="M32 54c-9-7.5-18-14.6-18-24a10.4 10.4 0 0 1 18-7.1"
            stroke="#C41E3A"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </svg>
      </div>

      <div className="text-center">
        <p className="font-display text-4xl font-semibold tracking-tight text-maroon">
          Jozi Bakes
        </p>
        <p className="mt-2 text-sm tracking-[0.25em] text-cocoa/70 uppercase">
          preheating the oven
        </p>
      </div>

      <div className="w-56 max-w-[70vw]">
        <div className="h-1.5 overflow-hidden rounded-full bg-linen shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-maroon to-jozi-red transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs font-semibold tabular-nums text-cocoa/60">
          {pct}%
        </p>
      </div>
    </div>
  );
}
