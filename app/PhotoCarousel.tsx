'use client';

import { useEffect, useRef } from 'react';

/**
 * Showreel + Gallery merged into one full-width horizontal ribbon.
 *
 * A repeating set — an animated "Showreel" speech bubble followed by the
 * photos — is chained end to end. It auto-scrolls on a seamless loop and, at
 * the same time, shifts with the page's vertical scroll, so the ribbon drifts
 * on its own but also reacts as you move down the page.
 */
const PHOTOS = [
  { src: '/images/rolls.png', alt: 'Freshly baked golden dinner rolls' },
  { src: '/images/gallery-babka.jpg', alt: 'Caramel babka loaf' },
  { src: '/images/gallery-cookie.jpg', alt: 'Chocolate-drizzled cookies' },
  { src: '/images/gallery-bread.jpg', alt: 'Sliced artisan ciabatta bread' },
];

const SETS = 3; // enough copies for a seamless wrap on any viewport
const AUTO_SPEED = 46; // px per second the ribbon drifts on its own
const SCROLL_FACTOR = 0.45; // how strongly page scroll pushes the ribbon

function ShowreelBubble() {
  return (
    <div className="reel__item reel__bubble" aria-hidden="true">
      <span className="reel__bubbleText">
        Showreel<span className="reel__caret">▌</span>
      </span>
    </div>
  );
}

export default function PhotoCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const itemsPerSet = PHOTOS.length + 1; // +1 for the Showreel bubble
    let setWidth = 0;
    let base = 0; // auto-scroll accumulator
    let last = performance.now();
    let running = false;
    let raf = 0;

    const measure = () => {
      if (track.children.length > itemsPerSet) {
        setWidth =
          (track.children[itemsPerSet] as HTMLElement).offsetLeft -
          (track.children[0] as HTMLElement).offsetLeft;
      }
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      base += AUTO_SPEED * dt;
      if (!setWidth) measure();
      if (setWidth > 0) {
        const raw = base + window.scrollY * SCROLL_FACTOR;
        const pos = ((raw % setWidth) + setWidth) % setWidth;
        track.style.transform = `translate3d(${-pos}px,0,0)`;
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only animate while the ribbon is on screen.
    const io = new IntersectionObserver(
      (entries) => (entries[0].isIntersecting ? start() : stop()),
      { rootMargin: '100px 0px' },
    );
    io.observe(track.parentElement as Element);

    const onResize = () => {
      setWidth = 0;
      measure();
    };
    window.addEventListener('resize', onResize);
    measure();

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="reel" aria-label="Showreel gallery">
      <div className="reel__track" ref={trackRef}>
        {Array.from({ length: SETS }).flatMap((_, s) => [
          <ShowreelBubble key={`b-${s}`} />,
          ...PHOTOS.map((p, i) => (
            <div className="reel__item" key={`p-${s}-${i}`}>
              <img src={p.src} alt={s === 0 ? p.alt : ''} loading="lazy" />
            </div>
          )),
        ])}
      </div>
    </section>
  );
}
