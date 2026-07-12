'use client';

import { useRef } from 'react';
import { useCart } from './CartProvider';
import { useOverlay } from './useOverlay';
import { CATEGORIES, CATEGORY_BY_ID, formatPrice } from './menu';

/**
 * The order popup. Opens focused on one category but keeps every category a
 * tap away via the tabs, so a whole order can be built without ever closing
 * it. Adding a line writes straight to the shared cart, which the footer
 * summarises live and hands off to the cart drawer.
 */
export default function OrderMenu() {
  const {
    menuCategory,
    cart,
    add,
    setQty,
    count,
    subtotal,
    openMenu,
    closeMenu,
    openCart,
  } = useCart();

  const isOpen = menuCategory !== null;
  const { mounted, shown } = useOverlay(isOpen);

  // Keep the last opened category on screen through the exit animation.
  const lastCat = useRef<string>(CATEGORIES[0].id);
  if (menuCategory) lastCat.current = menuCategory;
  const category = CATEGORY_BY_ID[menuCategory ?? lastCat.current];

  if (!mounted || !category) return null;

  return (
    <div
      className={`order${shown ? ' order--in' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${category.name}`}
    >
      <div className="order__scrim" onClick={closeMenu} />

      <div className="order__panel" role="document">
        <button
          className="order__close"
          onClick={closeMenu}
          aria-label="Close menu"
        >
          <span />
          <span />
        </button>

        <div className="order__head">
          <span className="order__eyebrow">Order</span>
          <h2 className="order__title">{category.name}</h2>
          <p className="order__blurb">{category.blurb}</p>
        </div>

        <div className="order__tabs" role="tablist">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={c.id === category.id}
              className={`order__tab${
                c.id === category.id ? ' order__tab--on' : ''
              }`}
              onClick={() => openMenu(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <ul className="order__list">
          {category.items.map((item, i) => {
            const qty = cart[item.id] ?? 0;
            return (
              <li
                className="order__item"
                key={item.id}
                style={{ ['--i' as string]: i }}
              >
                <div className="order__itemMain">
                  <span className="order__itemName">{item.name}</span>
                  <span className="order__itemNote">{item.note}</span>
                </div>
                <span className="order__itemPrice">
                  {formatPrice(item.price)}
                </span>
                {qty === 0 ? (
                  <button
                    className="order__add"
                    onClick={() => add(item.id)}
                    aria-label={`Add ${item.name}`}
                  >
                    Add
                  </button>
                ) : (
                  <div
                    className="stepper"
                    aria-label={`${item.name} quantity`}
                  >
                    <button
                      className="stepper__btn"
                      onClick={() => setQty(item.id, qty - 1)}
                      aria-label={`Remove one ${item.name}`}
                    >
                      −
                    </button>
                    <span className="stepper__count">{qty}</span>
                    <button
                      className="stepper__btn"
                      onClick={() => add(item.id)}
                      aria-label={`Add one ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="order__foot">
          <div className="order__footInfo">
            <span className="order__footCount">
              {count === 0
                ? 'Cart is empty'
                : `${count} item${count === 1 ? '' : 's'}`}
            </span>
            {count > 0 && (
              <span className="order__footTotal">{formatPrice(subtotal)}</span>
            )}
          </div>
          <button
            className="btn btn--light order__viewCart"
            onClick={openCart}
            disabled={count === 0}
          >
            View cart
          </button>
        </div>
      </div>
    </div>
  );
}
