'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Drives mount + enter/exit transitions for an overlay from a single open
 * boolean. `mounted` stays true through the exit animation so the panel can
 * slide/fade out before it leaves the DOM; `shown` flips on one frame after
 * mount so the enter transition actually plays.
 */
export function useOverlay(isOpen: boolean, exitMs = 280) {
  const [mounted, setMounted] = useState(isOpen);
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(timer.current);
    if (isOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    timer.current = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(timer.current);
  }, [isOpen, exitMs]);

  return { mounted, shown };
}
