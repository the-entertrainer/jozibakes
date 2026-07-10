'use client';

import { useEffect, useState } from 'react';
import { ITEM_BY_ID, CURRENCY } from '../data/menu';

const WHATSAPP_NUMBER = ''; // e.g. '9198XXXXXXXX' — leave blank to disable the link

/**
 * Floating cart button + cart bottom sheet. Lightweight: review quantities and
 * hand off to WhatsApp with a prefilled order (no payment step). Cart state
 * lives in the parent.
 */
export default function Cart({
  cart,
  onAdd,
  onRemove,
  onClear,
}: {
  cart: Record<string, number>;
  onAdd: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  const lines = Object.entries(cart).filter(([, q]) => q > 0);
  const count = lines.reduce((n, [, q]) => n + q, 0);
  const total = lines.reduce((sum, [id, q]) => sum + (ITEM_BY_ID[id]?.price ?? 0) * q, 0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const t = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(t);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 320);
    return () => clearTimeout(t);
  }, [open]);

  // Nothing to show and never opened: hide the FAB entirely.
  if (count === 0 && !mounted) return null;

  const orderText = encodeURIComponent(
    `Hi Jozi! I'd like to order:\n${lines
      .map(([id, q]) => `• ${q}× ${ITEM_BY_ID[id]?.name ?? id}`)
      .join('\n')}\n\nTotal: ${CURRENCY}${total}`,
  );
  const waHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${orderText}`
    : undefined;

  return (
    <>
      {count > 0 && (
        <button
          type="button"
          className="cart-fab"
          onClick={() => setOpen(true)}
          aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
        >
          <span className="cart-fab-icon" aria-hidden="true">
            🛍️
          </span>
          <span className="cart-fab-count tabular-nums">{count}</span>
          <span className="cart-fab-total tabular-nums">
            {CURRENCY}
            {total}
          </span>
        </button>
      )}

      {mounted && (
        <>
          <div
            className={`sheet-scrim ${shown ? 'is-open' : ''}`}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <section
            className={`sheet ${shown ? 'is-open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
          >
            <div className="sheet-grip" aria-hidden="true" />
            <div className="sheet-header px-5">
              <h2 className="font-display text-xl font-semibold text-maroon">Your order</h2>
              {lines.length > 0 && (
                <button type="button" className="text-xs font-semibold text-cocoa/50" onClick={onClear}>
                  Clear
                </button>
              )}
            </div>

            <div className="sheet-body px-4">
              {lines.length === 0 ? (
                <p className="py-8 text-center text-sm text-cocoa/50">Your bag is empty.</p>
              ) : (
                lines.map(([id, q]) => {
                  const item = ITEM_BY_ID[id];
                  if (!item) return null;
                  return (
                    <div key={id} className="menu-row">
                      <span className="menu-emoji" aria-hidden="true">
                        {item.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-cocoa">{item.name}</p>
                        <p className="text-xs text-cocoa/55">
                          {CURRENCY}
                          {item.price} · {q}× = {CURRENCY}
                          {item.price * q}
                        </p>
                      </div>
                      <div className="stepper" role="group" aria-label={`${item.name} quantity`}>
                        <button type="button" onClick={() => onRemove(id)} aria-label="Remove one">
                          −
                        </button>
                        <span className="tabular-nums">{q}</span>
                        <button type="button" onClick={() => onAdd(id)} aria-label="Add one">
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {lines.length > 0 && (
              <div className="sheet-footer px-4">
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-cocoa">
                  <span>Total</span>
                  <span className="tabular-nums text-maroon">
                    {CURRENCY}
                    {total}
                  </span>
                </div>
                {waHref ? (
                  <a className="cta-btn block text-center" href={waHref} target="_blank" rel="noreferrer">
                    Order on WhatsApp
                  </a>
                ) : (
                  <button type="button" className="cta-btn w-full" onClick={() => setOpen(false)}>
                    Place order
                  </button>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
