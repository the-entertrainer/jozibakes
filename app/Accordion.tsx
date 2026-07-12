'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Expandable detail panels — the str8fire-style progressive-disclosure
 * pattern (their IP pages use "+"-toggle accordions), adapted for product
 * detail that's genuinely optional to read rather than the section's only
 * content. Height animates via the `grid-template-rows: 0fr -> 1fr` trick,
 * so there's no JS height measurement involved, just a CSS transition.
 */
function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`accordion__item${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="accordion__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="accordion__icon" aria-hidden="true" />
      </button>
      <div className="accordion__panel">
        <div className="accordion__panelInner">{children}</div>
      </div>
    </div>
  );
}

export default function Accordion({
  items,
}: {
  items: { title: string; content: string }[];
}) {
  return (
    <div className="accordion">
      {items.map((item) => (
        <AccordionItem key={item.title} title={item.title}>
          <p>{item.content}</p>
        </AccordionItem>
      ))}
    </div>
  );
}
