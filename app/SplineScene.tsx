'use client';

import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';

const SCENE_URL = 'https://prod.spline.design/Le2iIYYasafjz8Ib/scene.splinecode';

export default function SplineScene() {
  function handleLoad(app: Application) {
    // Fill the whole viewport at full device pixel ratio. The runtime
    // renders at window.devicePixelRatio, so setSize keeps the canvas
    // crisp on first paint, on resize, and on device rotation.
    const resize = () => app.setSize(window.innerWidth, window.innerHeight);
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
  }

  return <Spline scene={SCENE_URL} onLoad={handleLoad} />;
}
