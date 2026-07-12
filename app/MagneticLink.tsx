'use client';

import { useRef } from 'react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

/**
 * A button that leans gently toward the cursor as it approaches — a small,
 * tactile "premium" detail rather than a static hit target. Pure mouse
 * events: touch devices never fire mousemove, so this is a no-op there
 * without needing an explicit pointer-type check.
 */
export default function MagneticLink({
  className,
  children,
  ...rest
}: {
  className?: string;
  children: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
    <a
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </a>
  );
}
