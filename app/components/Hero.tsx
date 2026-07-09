'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import Loader from './Loader';
import RpgMenu from './RpgMenu';

const HeroSpline = dynamic(() => import('./HeroSpline'), { ssr: false });

/** Deterministic flour-dust specks (fixed values avoid hydration drift). */
const DUST = [
  { left: 12, top: 34, size: 5, delay: 0, duration: 11 },
  { left: 22, top: 58, size: 3, delay: 2.2, duration: 13 },
  { left: 31, top: 42, size: 4, delay: 4.8, duration: 10 },
  { left: 44, top: 66, size: 3, delay: 1.4, duration: 12 },
  { left: 52, top: 38, size: 5, delay: 6.1, duration: 14 },
  { left: 63, top: 55, size: 3, delay: 3.3, duration: 11 },
  { left: 71, top: 40, size: 4, delay: 7.6, duration: 13 },
  { left: 80, top: 62, size: 3, delay: 0.9, duration: 10 },
  { left: 87, top: 45, size: 5, delay: 5.2, duration: 12 },
  { left: 17, top: 72, size: 3, delay: 8.4, duration: 14 },
  { left: 58, top: 74, size: 4, delay: 2.9, duration: 12 },
  { left: 90, top: 70, size: 3, delay: 6.8, duration: 11 },
];

export default function Hero() {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [joziScreen, setJoziScreen] = useState<{ x: number; y: number } | null>(null);

  const onProgress = useCallback((p: number) => setProgress(p), []);
  const onReady = useCallback(() => {
    setProgress(100);
    setReady(true);
  }, []);
  const onJoziScreen = useCallback((pos: { x: number; y: number } | null) => {
    setJoziScreen(pos);
  }, []);

  return (
    <section className="h-hero grain relative w-full overflow-hidden bg-cream-warm">
      {/* 3D diorama (own render loop; camera driven by tap/pointer) */}
      <div className="pointer-events-none absolute inset-0">
        <HeroSpline
          engaged={engaged}
          onJoziScreen={onJoziScreen}
          onProgress={onProgress}
          onReady={onReady}
        />
      </div>

      {/* warm vignette over the opaque scene canvas */}
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* drifting flour dust */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {DUST.map((d, i) => (
          <span
            key={i}
            className="dust"
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: d.size,
              height: d.size,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.duration}s`,
            }}
          />
        ))}
      </div>

      {/* tap-capture layer: tapping anywhere toggles the engaged/close-up state */}
      <button
        type="button"
        aria-label={engaged ? 'Step back from Jozi' : 'Say hi to Jozi'}
        className="absolute inset-0 h-full w-full cursor-pointer"
        onClick={() => setEngaged((e) => !e)}
      />

      {/* typography overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
        <header
          className="flex flex-col items-center text-center transition-opacity duration-300 ease-out"
          style={{ opacity: engaged ? 0 : 1 }}
        >
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
          className="transition-opacity duration-300 ease-out"
          style={{ opacity: engaged ? 0 : 1 }}
        >
          <div
            className="animate-fade-up flex flex-col items-center gap-1.5"
            style={{ animationDelay: '0.8s' }}
          >
            <p className="text-[0.65rem] font-bold tracking-[0.25em] text-cocoa/50 uppercase">
              Tap to say hi
            </p>
            <span className="animate-float text-base" aria-hidden="true">
              👋
            </span>
          </div>
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

      <RpgMenu anchor={joziScreen} open={engaged} onClose={() => setEngaged(false)} />

      <Loader progress={progress} ready={ready} />
    </section>
  );
}
