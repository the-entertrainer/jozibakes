'use client';

import { useEffect, useRef, useState } from 'react';
import { useScenePreload } from './ScenePreloadProvider';

/**
 * A brief ceremonial curtain on first paint that doubles as a real preloader:
 * while it's up, every Spline scene on the page is mounting and loading behind
 * it. The gate holds until all scenes report ready (loaded or failed over to
 * their fallback), so the page is smooth to scroll the instant it's revealed —
 * no 3D pop-in as sections come into view.
 *
 * Guardrails keep it from ever trapping the user: a hard cap lifts the curtain
 * no matter what (a stuck/slow scene can't hold it forever), a minimum keeps
 * it from flashing away on a fast cache hit, and it's tap-anywhere-to-skip. A
 * <noscript> override means a JS-disabled visitor never gets stuck behind it.
 *
 * It's a once-per-session ceremony: the module-level flag below means bouncing
 * back to home from the menu or gallery lands instantly, with no curtain replay
 * (a full page reload starts a fresh session and shows it again).
 */
const MIN_MS = 900; // don't flash away faster than this
const MAX_MS = 8000; // hard cap so a stalled scene can't trap the user
const REDUCED_MS = 200;
const LEAVE_MS = 650; // matches the curtain's exit transition

// Persists across client-side navigations within one page load (but not a
// full reload), so the gate only greets the visitor once.
let hasEntered = false;

export default function EntranceGate() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(hasEntered);
  const { total, ready } = useScenePreload();
  const startRef = useRef(0);
  const reduceRef = useRef(false);
  const leftRef = useRef(false);

  const leave = () => {
    if (leftRef.current) return;
    leftRef.current = true;
    hasEntered = true;
    setLeaving(true);
    document.body.style.overflow = '';
    window.setTimeout(() => setGone(true), LEAVE_MS);
  };

  useEffect(() => {
    startRef.current = performance.now();
    reduceRef.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    document.body.style.overflow = 'hidden';
    // Hard safety cap — reveal even if a scene never resolves.
    const cap = window.setTimeout(leave, reduceRef.current ? REDUCED_MS : MAX_MS);
    return () => window.clearTimeout(cap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reveal once every registered scene is ready, but never before MIN_MS so
  // the entrance still reads as intentional rather than a flicker.
  useEffect(() => {
    if (leftRef.current) return;
    if (total > 0 && ready >= total) {
      const floor = reduceRef.current ? REDUCED_MS : MIN_MS;
      const wait = Math.max(0, floor - (performance.now() - startRef.current));
      const t = window.setTimeout(leave, wait);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, ready]);

  if (gone) return null;

  // Real load progress; a small floor so the bar shows life before scenes
  // have even registered.
  const pct = leaving
    ? 100
    : total > 0
      ? Math.max(6, Math.round((ready / total) * 100))
      : 6;

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
          <div className="gate__fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="gate__hint">
          {pct < 100 ? 'Warming the oven' : 'Tap to enter'}
        </div>
      </div>
    </>
  );
}
