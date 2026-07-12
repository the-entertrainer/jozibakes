'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useCart } from './CartProvider';

/**
 * The site's "Order Now" call to action. Opens the ordering popup — at a
 * specific category when one is given (the per-band buttons), or at the
 * first category otherwise (nav / hero / contact). Carries the same gentle
 * magnetic lean toward the cursor as MagneticLink, but as a real <button>
 * so it can drive the cart instead of navigating.
 */
export default function OrderButton({
  category,
  className,
  children,
  ...rest
}: {
  category?: string;
  className?: string;
  children: ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  const ref = useRef<HTMLButtonElement>(null);
  const { openMenu } = useCart();

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transition = 'transform 0.15s ease-out';
    el.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.transform = '';
  };

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={() => openMenu(category)}
      {...rest}
    >
      {children}
    </button>
  );
}
