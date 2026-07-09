'use client';

import { useEffect, useState } from 'react';

/** Placeholder items — wire these up once the menu/about/contact sections exist. */
const ITEMS = [
  { label: 'Our Bakes', emoji: '🧁' },
  { label: 'About Jozi', emoji: '👩‍🍳' },
  { label: 'Say Hi', emoji: '👋' },
];

const MENU_WIDTH = 216;
const MENU_HEIGHT_ESTIMATE = 190;
const MARGIN = 16;
const REVEAL_DELAY_MS = 450;
/** Below Jozi's projected anchor, on narrow portrait screens there's no room
    to sit beside her without covering her — drop the menu below her instead,
    tail pointing up. */
const BELOW_GAP = 210;

export default function RpgMenu({
  anchor,
  open,
  onClose,
}: {
  anchor: { x: number; y: number } | null;
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const t = setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
      return () => clearTimeout(t);
    }
    setRevealed(false);
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
  }, [open]);

  if (!mounted || !anchor) return null;

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const portrait = viewportHeight > viewportWidth;

  let left: number;
  let top: number;
  let tailSide: 'left' | 'right' | 'top';

  if (portrait) {
    left = Math.min(
      Math.max(anchor.x - MENU_WIDTH / 2, MARGIN),
      viewportWidth - MENU_WIDTH - MARGIN,
    );
    top = Math.min(anchor.y + BELOW_GAP, viewportHeight - MENU_HEIGHT_ESTIMATE - MARGIN);
    tailSide = 'top';
  } else {
    left = Math.min(
      Math.max(anchor.x + 30, MARGIN),
      viewportWidth - MENU_WIDTH - MARGIN,
    );
    top = Math.min(
      Math.max(anchor.y - MENU_HEIGHT_ESTIMATE / 2, MARGIN),
      viewportHeight - MENU_HEIGHT_ESTIMATE - MARGIN,
    );
    tailSide = left >= anchor.x ? 'left' : 'right';
  }

  return (
    <div
      className="absolute z-40 transition-all duration-300 ease-out"
      style={{
        left,
        top,
        width: MENU_WIDTH,
        opacity: revealed ? 1 : 0,
        transform: `perspective(700px) ${
          tailSide === 'top' ? '' : `rotateY(${tailSide === 'left' ? -3 : 3}deg) `
        }scale(${revealed ? 1 : 0.85}) translateY(${revealed ? 0 : 10}px)`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`rpg-menu rpg-menu-tail-${tailSide}`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-maroon/20 bg-cream text-xs font-bold text-maroon shadow-sm"
        >
          ×
        </button>
        <p className="mb-2 text-center font-display text-sm font-semibold text-maroon">
          Hi, I&apos;m Jozi!
        </p>
        <div className="flex flex-col gap-2">
          {ITEMS.map((item) => (
            <a
              key={item.label}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-2 rounded-lg border border-maroon/15 bg-cream/80 px-3 py-2 text-sm font-semibold text-cocoa transition-colors hover:bg-linen active:scale-[0.98]"
            >
              <span aria-hidden="true">{item.emoji}</span>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
