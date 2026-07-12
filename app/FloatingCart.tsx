'use client';

import { useCart } from './CartProvider';

/**
 * Persistent cart handle, bottom-right. Appears the moment there's something
 * to review and stays put across the whole page, so the cart is always one
 * tap away no matter which category you wandered off into.
 */
export default function FloatingCart() {
  const { count, subtotal, openCart, cartOpen, menuCategory } = useCart();

  // Hide while empty, or while an overlay already owns the screen.
  const hidden = count === 0 || cartOpen || menuCategory !== null;

  return (
    <button
      className={`fab${hidden ? '' : ' fab--in'}`}
      onClick={openCart}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="fab__icon">
        <path
          d="M4 4h2l2.4 12.4a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.8L21.5 8H7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="20" r="1.4" fill="currentColor" />
        <circle cx="18" cy="20" r="1.4" fill="currentColor" />
      </svg>
      <span className="fab__count" key={count}>
        {count}
      </span>
      <span className="fab__total">₹{subtotal.toLocaleString('en-IN')}</span>
    </button>
  );
}
