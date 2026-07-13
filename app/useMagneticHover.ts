'use client';

import { useRef } from 'react';
import type { MouseEvent } from 'react';

/**
 * Shared cursor-lean interaction for primary CTAs — the element nudges
 * toward the pointer as it approaches and eases back on leave. Pure mouse
 * events, so touch devices are unaffected without an explicit check.
 * Previously duplicated byte-for-byte between MagneticLink and OrderButton.
 */
export function useMagneticHover<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onMouseMove = (e: MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transition = 'transform 0.15s ease-out';
    el.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.transform = '';
  };

  return { ref, onMouseMove, onMouseLeave };
}
