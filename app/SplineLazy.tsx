'use client';

// A thin re-export so callers can `next/dynamic(() => import('./SplineLazy'))`.
// Dynamically importing '@splinetool/react-spline' directly trips webpack's
// resolution of its conditional "exports" map (it only declares an "import"
// condition, which resolves differently for static vs. dynamic imports).
// Going through our own file — which reaches the package via an ordinary
// static import, the pattern that already works — sidesteps that entirely
// while still splitting the runtime into its own on-demand chunk.
export { default } from '@splinetool/react-spline';
