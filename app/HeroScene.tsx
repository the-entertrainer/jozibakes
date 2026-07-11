'use client';

import Spline from '@splinetool/react-spline';
import { useState } from 'react';

/**
 * Fullscreen hero background — the Jozi Bakes shop diorama.
 *
 * The scroll animation (camera pushes in toward the shop) is authored inside
 * Spline itself, driven by the page's scroll position, so this component just
 * mounts the scene and fades it in once it's ready. Until then the hero shows
 * its brand-red backdrop, so the text is never sitting on a blank void.
 */
const HERO_SCENE =
  'https://prod.spline.design/Le2iIYYasafjz8Ib/scene.splinecode';

export default function HeroScene() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`heroScene${loaded ? ' heroScene--on' : ''}`} aria-hidden>
      <Spline scene={HERO_SCENE} onLoad={() => setLoaded(true)} />
    </div>
  );
}
