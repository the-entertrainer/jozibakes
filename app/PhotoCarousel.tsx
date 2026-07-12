'use client';

import { useEffect, useRef } from 'react';

/**
 * Showreel + Gallery merged into one full-width horizontal ribbon.
 *
 * A repeating set — an animated "Showreel" speech bubble followed by the
 * photos — is chained end to end and wraps seamlessly. It:
 *   • auto-scrolls on its own,
 *   • shifts with the page's vertical scroll,
 *   • and can be flicked/swiped left and right (with momentum).
 */
const PHOTOS = [
  { src: '/images/rolls.webp', alt: 'Freshly baked golden dinner rolls' },
  { src: '/images/gallery-babka.webp', alt: 'Caramel babka loaf' },
  { src: '/images/gallery-cookie.webp', alt: 'Chocolate-drizzled cookies' },
  { src: '/images/gallery-bread.webp', alt: 'Sliced artisan ciabatta bread' },
];

const SETS = 3;
const AUTO_SPEED = 42; // px/s idle drift
const SCROLL_FACTOR = 0.4; // page-scroll coupling
const FLICK_DECAY = 2.6; // momentum time-constant (per second)
const MAX_FLICK = 2600; // px/s clamp

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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const itemsPerSet = PHOTOS.length + 1;
    let setWidth = 0;
    let pos = 0; // accumulated travel (auto + flick + drag)
    let momentum = 0; // px/s from a flick
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
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

    const apply = () => {
      if (!setWidth) measure();
      if (setWidth > 0) {
        const raw = pos + window.scrollY * SCROLL_FACTOR;
        const wrapped = ((raw % setWidth) + setWidth) % setWidth;
        track.style.transform = `translate3d(${-wrapped}px,0,0)`;
      }
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!dragging) {
        pos += (AUTO_SPEED + momentum) * dt;
        momentum *= Math.exp(-FLICK_DECAY * dt);
        if (Math.abs(momentum) < 1) momentum = 0;
      }
      apply();
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

    // Pointer / touch flick control
    const onDown = (e: PointerEvent) => {
      dragging = true;
      momentum = 0;
      velocity = 0;
      lastX = e.clientX;
      lastT = performance.now();
      section.setPointerCapture?.(e.pointerId);
      section.classList.add('reel--dragging');
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max((now - lastT) / 1000, 0.008);
      pos -= dx; // ribbon follows the finger
      velocity = dx / dt;
      lastX = e.clientX;
      lastT = now;
      apply();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      momentum = Math.max(-MAX_FLICK, Math.min(MAX_FLICK, -velocity));
      section.releasePointerCapture?.(e.pointerId);
      section.classList.remove('reel--dragging');
    };

    section.addEventListener('pointerdown', onDown);
    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerup', onUp);
    section.addEventListener('pointercancel', onUp);

    // Only animate while the ribbon is on screen.
    const io = new IntersectionObserver(
      (entries) => (entries[0].isIntersecting ? start() : stop()),
      { rootMargin: '100px 0px' },
    );
    io.observe(section);

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
      section.removeEventListener('pointerdown', onDown);
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerup', onUp);
      section.removeEventListener('pointercancel', onUp);
    };
  }, []);

  return (
    <section
      className="reel grain"
      aria-label="Showreel gallery"
      ref={sectionRef}
    >
      <div className="reel__track" ref={trackRef}>
        {Array.from({ length: SETS }).flatMap((_, s) => [
          <ShowreelBubble key={`b-${s}`} />,
          ...PHOTOS.map((p, i) => (
            <div className="reel__item" key={`p-${s}-${i}`}>
              <img
                src={p.src}
                alt={s === 0 ? p.alt : ''}
                loading="lazy"
                draggable={false}
              />
            </div>
          )),
        ])}
      </div>
    </section>
  );
}
