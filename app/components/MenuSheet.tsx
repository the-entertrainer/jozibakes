'use client';

import { useEffect, useState } from 'react';
import { MENU, CURRENCY } from '../data/menu';
import type { Station } from '../data/stations';

/**
 * Native-style bottom sheet. Opens on a station tap: the "menu" station shows
 * the tabbed catalogue with quantity steppers; the "about" station shows
 * Jozi's blurb with a shortcut into the menu.
 */
export default function MenuSheet({
  station,
  qtyOf,
  onAdd,
  onRemove,
  onClose,
  onJumpToOrder,
}: {
  station: Station | null;
  qtyOf: (itemId: string) => number;
  onAdd: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onClose: () => void;
  onJumpToOrder: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [tab, setTab] = useState(MENU[0].id);

  useEffect(() => {
    if (station) {
      setMounted(true);
      if (station.kind === 'menu') setTab(MENU[0].id);
      const t = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(t);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 320);
    return () => clearTimeout(t);
  }, [station]);

  if (!mounted) return null;

  const kind = station?.kind ?? 'menu';
  const category = MENU.find((c) => c.id === tab) ?? MENU[0];

  return (
    <>
      <div
        className={`sheet-scrim ${shown ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <section
        className={`sheet ${shown ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={station?.label ?? 'Menu'}
      >
        <div className="sheet-grip" aria-hidden="true" />

        {kind === 'about' ? (
          <div className="px-5 pb-2">
            <h2 className="font-display text-2xl font-semibold text-maroon">Hi, I&apos;m Jozi 👋</h2>
            <p className="mt-2 text-sm leading-relaxed text-cocoa/80">
              I bake small-batch cakes, brownies and cookies from my home kitchen in
              Kharghar, Navi Mumbai — everything fresh to order, with a lot of love and a
              little supervision from Bruno.
            </p>
            <button type="button" className="cta-btn mt-4 w-full" onClick={onJumpToOrder}>
              🧁 See the bakes
            </button>
          </div>
        ) : (
          <>
            <div className="sheet-header px-5">
              <h2 className="font-display text-xl font-semibold text-maroon">Our Bakes</h2>
              <p className="text-xs font-semibold tracking-wide text-cocoa/50 uppercase">
                Fresh to order
              </p>
            </div>

            <div className="tabs px-4">
              {MENU.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTab(c.id)}
                  className={`tab ${tab === c.id ? 'is-active' : ''}`}
                >
                  <span aria-hidden="true">{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>

            <div className="sheet-body px-4">
              {category.items.map((item) => {
                const qty = qtyOf(item.id);
                return (
                  <div key={item.id} className="menu-row">
                    <span className="menu-emoji" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-cocoa">{item.name}</p>
                      <p className="text-xs text-cocoa/55">
                        {CURRENCY}
                        {item.price}
                        {item.note ? ` · ${item.note}` : ''}
                      </p>
                    </div>
                    {qty === 0 ? (
                      <button
                        type="button"
                        className="add-btn"
                        onClick={() => onAdd(item.id)}
                        aria-label={`Add ${item.name}`}
                      >
                        Add
                      </button>
                    ) : (
                      <div className="stepper" role="group" aria-label={`${item.name} quantity`}>
                        <button type="button" onClick={() => onRemove(item.id)} aria-label="Remove one">
                          −
                        </button>
                        <span className="tabular-nums">{qty}</span>
                        <button type="button" onClick={() => onAdd(item.id)} aria-label="Add one">
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </>
  );
}
