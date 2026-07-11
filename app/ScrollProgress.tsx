'use client';

import { useEffect, useRef } from 'react';

/**
 * Thin fixed progress bar tracking how far down the page the reader is —
 * a quiet cinematic cue (think a film's chapter timeline) that also gives a
 * sense of how much of the story is left. rAF-throttled, no layout thrash.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="scrollbar" aria-hidden="true">
      <div className="scrollbar__fill" ref={barRef} />
    </div>
  );
}
