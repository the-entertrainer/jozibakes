'use client';

import dynamic from 'next/dynamic';
import Loader from './Loader';

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false });

export default function Hero() {
  return (
    <section className="h-hero grain relative w-full overflow-hidden bg-cream-warm">
      {/* warm vignette glow behind the diorama */}
      <div className="hero-glow absolute inset-0" aria-hidden="true" />

      {/* 3D diorama */}
      <div className="absolute inset-0">
        <HeroCanvas />
      </div>

      {/* typography overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
        <header className="flex flex-col items-center text-center">
          <p
            className="glass-chip animate-fade-up rounded-full px-4 py-1.5 text-[0.65rem] font-bold tracking-[0.22em] text-maroon uppercase sm:text-xs"
            style={{ animationDelay: '0.15s' }}
          >
            Home Bakery · Kharghar, Navi Mumbai
          </p>

          <h1
            className="font-display animate-fade-up hero-title mt-4 text-[17vw] leading-[0.95] font-semibold tracking-tight text-maroon sm:text-7xl md:text-8xl"
            style={{ animationDelay: '0.3s' }}
          >
            Jozi <span className="font-light italic">Bakes</span>
          </h1>

          <p
            className="animate-fade-up hero-tagline mt-3 max-w-xs text-sm leading-relaxed text-cocoa/80 sm:max-w-sm sm:text-base"
            style={{ animationDelay: '0.45s' }}
          >
            Small-batch cakes &amp; bakes, made with love —
            <br className="hidden sm:block" /> by Jozi, supervised by Bruno.
          </p>
        </header>

        <footer
          className="animate-fade-up flex flex-col items-center gap-1.5"
          style={{ animationDelay: '0.8s' }}
        >
          <p className="text-[0.65rem] font-bold tracking-[0.25em] text-cocoa/50 uppercase">
            More in the oven
          </p>
          <svg
            className="animate-float h-4 w-4 text-maroon/60"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 6l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </footer>
      </div>

      {/* floating hearts, very sparse */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="animate-float absolute top-[22%] left-[12%] text-lg text-jozi-red/25 sm:top-[28%] sm:left-[22%]">
          ♥
        </span>
        <span
          className="animate-float absolute top-[30%] right-[10%] text-sm text-maroon/20 sm:right-[20%]"
          style={{ animationDelay: '1.6s' }}
        >
          ♥
        </span>
      </div>

      <Loader />
    </section>
  );
}
