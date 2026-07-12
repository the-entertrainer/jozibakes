'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import SplineBoundary from './SplineBoundary';

// Same rationale as ScrollScene: keep the multi-MB Spline runtime out of
// this page's core JS bundle so it's fetched as its own chunk in parallel
// with (not as a blocker to) the rest of the page becoming interactive.
const Spline = dynamic(() => import('./SplineLazy'), { ssr: false });

/**
 * Fullscreen hero background — the Jozi Bakes shop diorama.
 *
 * The scroll animation (camera pushes in toward the shop) is authored inside
 * Spline itself, driven by the page's scroll position, so this component just
 * mounts the scene and fades it in once it's ready. Until then the hero shows
 * its brand-red backdrop, so the text is never sitting on a blank void.
 *
 * If the scene fails to load — a dropped request on a slow mobile connection,
 * or a Spline outage — a static render of the same shop stands in, so the
 * hero never collapses into an empty page.
 *
 * `disabled` skips Spline entirely — no mount, no network request, just the
 * fallback image from the start. Same isolation mechanism as ScrollScene's
 * `disabled` prop, for testing scenes one at a time.
 */
const HERO_SCENE =
  'https://prod.spline.design/Le2iIYYasafjz8Ib/scene.splinecode';

export default function HeroScene({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(disabled);

  if (failed) {
    return (
      <div className="heroScene heroScene--fallback heroScene--on" aria-hidden>
        <img
          src="/images/storefront.webp"
          alt=""
          className="heroScene__fallbackImg"
        />
      </div>
    );
  }

  return (
    <div className={`heroScene${loaded ? ' heroScene--on' : ''}`} aria-hidden>
      <SplineBoundary onError={() => setFailed(true)}>
        <Spline scene={HERO_SCENE} onLoad={() => setLoaded(true)} />
      </SplineBoundary>
    </div>
  );
}
