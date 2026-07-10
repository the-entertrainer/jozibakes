'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import Loader from './Loader';
import MenuSheet from './MenuSheet';
import Cart from './Cart';
import { STATION_BY_ID } from '../data/stations';

const HeroSpline = dynamic(() => import('./HeroSpline'), { ssr: false });

export default function Hero() {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});

  const onProgress = useCallback((p: number) => setProgress(p), []);
  const onReady = useCallback(() => {
    setProgress(100);
    setReady(true);
  }, []);

  const selectStation = useCallback((id: string) => setActiveStationId(id), []);
  const closeStation = useCallback(() => setActiveStationId(null), []);

  const addToCart = useCallback(
    (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 })),
    [],
  );
  const removeFromCart = useCallback(
    (id: string) =>
      setCart((c) => {
        const next = (c[id] ?? 0) - 1;
        const copy = { ...c };
        if (next <= 0) delete copy[id];
        else copy[id] = next;
        return copy;
      }),
    [],
  );
  const clearCart = useCallback(() => setCart({}), []);
  const qtyOf = useCallback((id: string) => cart[id] ?? 0, [cart]);

  const activeStation = useMemo(
    () => (activeStationId ? STATION_BY_ID[activeStationId] ?? null : null),
    [activeStationId],
  );

  return (
    <section className="h-hero relative w-full overflow-hidden bg-cream-warm">
      {/* isometric diorama + hotspots (owns its own pointer events) */}
      <HeroSpline
        activeStationId={activeStationId}
        onSelectStation={selectStation}
        onBackgroundTap={closeStation}
        onProgress={onProgress}
        onReady={onReady}
      />

      {/* soft graded vignette over the scene for depth */}
      <div className="scene-grade pointer-events-none absolute inset-0 z-20" aria-hidden="true" />

      {/* brand header — fades out while a station sheet is open */}
      <header
        className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col items-center px-6 pt-[calc(env(safe-area-inset-top)+1.4rem)] text-center transition-opacity duration-300 ease-out"
        style={{ opacity: activeStationId ? 0 : 1 }}
      >
        <p className="glass-chip rounded-full px-4 py-1.5 text-[0.62rem] font-bold tracking-[0.22em] text-maroon uppercase">
          Home Bakery · Kharghar, Navi Mumbai
        </p>
        <h1 className="font-display mt-3 text-[13vw] leading-[0.95] font-semibold tracking-tight text-maroon sm:text-6xl">
          Jozi <span className="font-light italic">Bakes</span>
        </h1>
      </header>

      {/* hint — only before anything is opened */}
      <footer
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center pb-[calc(env(safe-area-inset-bottom)+1.4rem)] transition-opacity duration-300 ease-out"
        style={{ opacity: ready && !activeStationId ? 1 : 0 }}
      >
        <div className="glass-chip flex items-center gap-2 rounded-full px-4 py-2">
          <span className="hint-pulse" aria-hidden="true" />
          <span className="text-[0.7rem] font-semibold tracking-wide text-cocoa/70">
            Tap a glowing spot · drag to look around
          </span>
        </div>
      </footer>

      <MenuSheet
        station={activeStation}
        qtyOf={qtyOf}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onClose={closeStation}
        onJumpToOrder={() => setActiveStationId('counter')}
      />

      <Cart cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClear={clearCart} />

      <Loader progress={progress} ready={ready} />
    </section>
  );
}
