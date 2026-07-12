'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

/**
 * Showreel + Gallery merged into one full-width horizontal ribbon.
 *
 * The idle drift is a pure CSS `@keyframes` animation — it runs on the
 * compositor thread, so it stays smooth even while the main thread is busy
 * (Spline's WebGL scenes, image decode, React work, etc.), unlike a
 * setInterval/rAF loop driving `style.transform` by hand. JS only steps in
 * while a finger is actually down: it disables the animation, tracks the
 * drag 1:1, then hands off to a single CSS transition for the release
 * "fling" before resuming the animation exactly where it left off.
 *
 * Each photo's real pixel dimensions are given to next/image so it can
 * generate a correctly-scaled srcset — CSS still governs the rendered
 * size (`height: 100%; width: auto`), preserving each photo's own aspect
 * ratio at a fixed ribbon height.
 */
const PHOTOS = [
  {
    src: '/images/rolls.webp',
    alt: 'Freshly baked golden dinner rolls',
    width: 896,
    height: 1195,
  },
  {
    src: '/images/gallery-babka.webp',
    alt: 'Caramel babka loaf',
    width: 600,
    height: 800,
  },
  {
    src: '/images/gallery-cookie.webp',
    alt: 'Chocolate-drizzled cookies',
    width: 800,
    height: 600,
  },
  {
    src: '/images/gallery-bread.webp',
    alt: 'Sliced artisan ciabatta bread',
    width: 600,
    height: 800,
  },
];

// Exactly 2 — a CSS `translate3d(-50%,0,0)` loop only wraps seamlessly with
// two identical copies of the content back to back.
const SETS = 2;
const DURATION_S = 34; // one full idle loop
const FLING_MS = 900;
const FLING_MULTIPLIER = 0.32;
const MAX_FLING_PX = 420;

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
    let dragging = false;
    let dragX = 0; // track's live translateX while dragging/flinging
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;

    const measure = () => {
      if (track.children.length > itemsPerSet) {
        setWidth =
          (track.children[itemsPerSet] as HTMLElement).offsetLeft -
          (track.children[0] as HTMLElement).offsetLeft;
      }
    };

    // Reads the track's current on-screen X offset, whether it's currently
    // driven by the CSS animation, a transition, or an inline style.
    const currentTranslateX = () => {
      const m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
      return m.m41;
    };

    // Hands control back to the CSS animation, seeking it to `x` via a
    // negative animation-delay so playback continues from exactly where
    // the drag/fling left off — no visible jump.
    const resumeAnimation = (x: number) => {
      if (!setWidth) measure();
      if (setWidth > 0) {
        const norm = ((x % setWidth) + setWidth) % setWidth;
        track.style.animationDelay = `${-(norm / setWidth) * DURATION_S}s`;
      }
      track.style.transition = '';
      track.style.transform = '';
      section.classList.remove('reel--dragging');
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      dragX = currentTranslateX();
      velocity = 0;
      lastX = e.clientX;
      lastT = performance.now();
      section.setPointerCapture?.(e.pointerId);
      // adding this class disables the CSS animation (see globals.css) so
      // the inline transform below takes sole ownership of the property
      section.classList.add('reel--dragging');
      track.style.transition = 'none';
      track.style.transform = `translate3d(${dragX}px,0,0)`;
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max((now - lastT) / 1000, 0.008);
      dragX += dx;
      velocity = dx / dt;
      lastX = e.clientX;
      lastT = now;
      track.style.transform = `translate3d(${dragX}px,0,0)`;
    };

    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      section.releasePointerCapture?.(e.pointerId);

      const fling = Math.max(
        -MAX_FLING_PX,
        Math.min(MAX_FLING_PX, velocity * FLING_MULTIPLIER),
      );
      const target = dragX + fling;
      track.style.transition = `transform ${FLING_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      track.style.transform = `translate3d(${target}px,0,0)`;

      const onEnd = () => {
        track.removeEventListener('transitionend', onEnd);
        resumeAnimation(target);
      };
      track.addEventListener('transitionend', onEnd, { once: true });
    };

    section.addEventListener('pointerdown', onDown);
    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerup', onUp);
    section.addEventListener('pointercancel', onUp);

    const onResize = () => {
      setWidth = 0;
      measure();
    };
    window.addEventListener('resize', onResize);
    measure();

    return () => {
      window.removeEventListener('resize', onResize);
      section.removeEventListener('pointerdown', onDown);
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerup', onUp);
      section.removeEventListener('pointercancel', onUp);
    };
  }, []);

  return (
    <section className="reel" aria-label="Showreel gallery" ref={sectionRef}>
      <div
        className="reel__track"
        ref={trackRef}
        style={{ ['--reel-duration' as string]: `${DURATION_S}s` }}
      >
        {Array.from({ length: SETS }).flatMap((_, s) => [
          <ShowreelBubble key={`b-${s}`} />,
          ...PHOTOS.map((p, i) => (
            <div className="reel__item" key={`p-${s}-${i}`}>
              <Image
                src={p.src}
                alt={s === 0 ? p.alt : ''}
                width={p.width}
                height={p.height}
                draggable={false}
              />
            </div>
          )),
        ])}
      </div>
    </section>
  );
}
