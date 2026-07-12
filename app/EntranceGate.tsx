'use client';

import { useEffect, useState } from 'react';

/**
 * A brief ceremonial curtain on first paint — brand mark, a filling bar,
 * gone. Inspired by "click to enter" gated intros, adapted for a mobile
 * bakery audience that wants the menu fast: it's tap-anywhere-to-skip and
 * auto-dismisses on its own, never a hard barrier.
 *
 * The fill bar is a plain CSS `animation`, not a per-frame JS loop — the
 * only JS involved is a single scheduled timeout matching its duration.
 * A <noscript> override means a user with JS disabled never gets stuck
 * behind it (the gate's own dismiss logic requires JS to run).
 */
const DURATION_MS = 1300;
const REDUCED_MOTION_MS = 150;

export default function EntranceGate() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(
      leave,
      reduceMotion ? REDUCED_MOTION_MS : DURATION_MS,
    );
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leave = () => {
    setLeaving(true);
    document.body.style.overflow = '';
    window.setTimeout(() => setGone(true), 650);
  };

  if (gone) return null;

  return (
    <>
      <noscript>
        <style>{`.gate { display: none !important; }`}</style>
      </noscript>
      <div
        className={`gate${leaving ? ' gate--leaving' : ''}`}
        onClick={leave}
        role="presentation"
      >
        <div className="gate__brand">Jozi Bakes</div>
        <div className="gate__bar" aria-hidden="true">
          <div
            className={`gate__fill${leaving ? '' : ' gate__fill--animate'}`}
          />
        </div>
        <div className="gate__hint">Tap to enter</div>
      </div>
    </>
  );
}
