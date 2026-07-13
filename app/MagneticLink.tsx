'use client';

import type { ComponentProps } from 'react';
import Link from 'next/link';
import { useMagneticHover } from './useMagneticHover';

/**
 * A primary-CTA link that leans gently toward the cursor as it approaches —
 * the same tactile detail OrderButton carries, so every `.btn` behaves
 * consistently whether it opens the cart or navigates. Wraps next/link so
 * client-side routing is preserved.
 */
export default function MagneticLink({
  children,
  ...rest
}: ComponentProps<typeof Link>) {
  const { ref, onMouseMove, onMouseLeave } =
    useMagneticHover<HTMLAnchorElement>();

  return (
    <Link ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} {...rest}>
      {children}
    </Link>
  );
}
