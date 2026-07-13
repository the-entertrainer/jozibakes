'use client';

import type { ReactNode } from 'react';
import { useCart } from './CartProvider';
import { useMagneticHover } from './useMagneticHover';

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
  const { ref, onMouseMove, onMouseLeave } =
    useMagneticHover<HTMLButtonElement>();
  const { openMenu } = useCart();

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={() => openMenu(category)}
      {...rest}
    >
      {children}
    </button>
  );
}
