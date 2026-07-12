'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';
import { useOverlay } from './useOverlay';
import { ITEM_BY_ID, buildWhatsAppLink, formatPrice } from './menuData';

/**
 * The cart. Slides in as a side panel on desktop, a bottom sheet on mobile.
 * Everything added from any category lands here, and "Send order on
 * WhatsApp" hands the whole list off to the bakery's chat with the order
 * pre-written, which is where the order is actually placed.
 */
export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    count,
    subtotal,
    setQty,
    add,
    remove,
    clear,
    closeCart,
    openMenu,
  } = useCart();

  const { mounted, shown } = useOverlay(cartOpen);
  const [name, setName] = useState('');

  if (!mounted) return null;

  const lines = Object.entries(cart).filter(([id, qty]) => ITEM_BY_ID[id] && qty > 0);

  const send = () => {
    window.open(buildWhatsAppLink(cart, name), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`cart${shown ? ' cart--in' : ''}`} role="dialog" aria-modal="true" aria-label="Your cart">
      <div className="cart__scrim" onClick={closeCart} />

      <aside className="cart__panel">
        <header className="cart__head">
          <h2 className="cart__title">Your order</h2>
          <button className="cart__close" onClick={closeCart} aria-label="Close cart">
            <span />
            <span />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="cart__empty">
            <p className="cart__emptyText">Nothing in here yet. Let us fix that.</p>
            <button className="btn btn--red" onClick={() => openMenu()}>
              Browse the menu
            </button>
          </div>
        ) : (
          <>
            <ul className="cart__list">
              {lines.map(([id, qty]) => {
                const item = ITEM_BY_ID[id];
                return (
                  <li className="cart__item" key={id}>
                    <div className="cart__itemMain">
                      <span className="cart__itemName">{item.name}</span>
                      <span className="cart__itemPrice">
                        {formatPrice(item.price * qty)}
                      </span>
                    </div>
                    <div className="cart__itemControls">
                      <div className="stepper" aria-label={`${item.name} quantity`}>
                        <button
                          className="stepper__btn"
                          onClick={() => setQty(id, qty - 1)}
                          aria-label={`Remove one ${item.name}`}
                        >
                          −
                        </button>
                        <span className="stepper__count">{qty}</span>
                        <button
                          className="stepper__btn"
                          onClick={() => add(id)}
                          aria-label={`Add one ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cart__remove"
                        onClick={() => remove(id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="cart__foot">
              <label className="cart__nameField">
                <span>Name for the order</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional, but nice to have"
                  autoComplete="name"
                />
              </label>

              <div className="cart__total">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <button className="btn btn--red cart__send" onClick={send}>
                Send order on WhatsApp
              </button>
              <p className="cart__fineprint">
                Opens WhatsApp with your order written out. Nothing is charged
                here, you confirm the details in chat.
              </p>
              <button className="cart__clear" onClick={clear}>
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
