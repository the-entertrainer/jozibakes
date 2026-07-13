'use client';

import { useEffect } from 'react';

// Primary/secondary CTAs and the order-flow's own extruded buttons — the
// whole "chunky toy-shop button" family, not the small repeat-tap controls
// (steppers, tabs) where a burst on every tap would feel like spam.
const SELECTOR = '.btn, .order__add, .fab';
const COLORS = ['var(--cream)', 'var(--ph-yellow)', 'var(--teal)', 'var(--red-deep)'];
const COUNT = 7;
const LIFE_MS = 650;

/**
 * A scatter of sugar sprinkles pops off any primary button on click — the
 * bakery's answer to a ripple effect. One delegated listener here covers
 * every `.btn` / `.order__add` / `.fab` on the site, current and future,
 * with zero per-button wiring: drop the class on a new CTA and it's in.
 *
 * Sprinkles are spawned into a single fixed overlay layer appended once to
 * `document.body`, positioned by viewport coordinates rather than as
 * children of the clicked button. A click is often exactly the moment
 * React re-renders that button's own subtree (the order popup's Add
 * button turns into a stepper the instant it's clicked) — appending into
 * it directly would race that reconciliation.
 */
export default function ButtonBurst() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layer = document.createElement('div');
    layer.className = 'sprinkle-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest<HTMLElement>(SELECTOR);
      if (!btn || btn.hasAttribute('disabled')) return;

      for (let i = 0; i < COUNT; i++) {
        const angle = (Math.PI * 2 * i) / COUNT + (Math.random() - 0.5) * 0.6;
        const dist = 26 + Math.random() * 22;
        const sprinkle = document.createElement('span');
        sprinkle.className = 'sprinkle';
        sprinkle.style.left = `${e.clientX}px`;
        sprinkle.style.top = `${e.clientY}px`;
        sprinkle.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        // slight downward bias so sprinkles fall rather than float evenly
        sprinkle.style.setProperty('--ty', `${Math.sin(angle) * dist + 10}px`);
        sprinkle.style.setProperty('--rot', `${(Math.random() - 0.5) * 300}deg`);
        sprinkle.style.setProperty(
          '--c',
          COLORS[Math.floor(Math.random() * COLORS.length)],
        );
        layer.appendChild(sprinkle);
        window.setTimeout(() => sprinkle.remove(), LIFE_MS);
      }
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      layer.remove();
    };
  }, []);

  return null;
}
