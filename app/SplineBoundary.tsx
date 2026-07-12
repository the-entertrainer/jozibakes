'use client';

import { Component } from 'react';
import type { ReactNode } from 'react';

/**
 * @splinetool/react-spline deliberately re-throws load failures during
 * render (`if (error) throw error`), expecting a React error boundary above
 * it. Without one, a single dropped request — very plausible on the flaky
 * or metered connections our mobile-first audience is on — takes down the
 * entire page with Next's generic "Application error" screen. This catches
 * that failure locally and swaps in `fallback` so the rest of the site
 * keeps working.
 */
export default class SplineBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.warn('Spline scene failed to load, showing static fallback:', error);
    this.props.onError();
  }

  render() {
    // The parent owns fallback rendering (it needs to react to the failure
    // too — swap sizing, stop showing a loading shimmer, etc.) — once
    // onError fires it stops rendering this boundary at all, so returning
    // null here is only ever visible for a single interim commit.
    return this.state.failed ? null : this.props.children;
  }
}
