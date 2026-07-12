/**
 * Single source of truth for everything menu-shaped: the four category
 * bands on the page, their order-popup items, and the copy that used to be
 * lorem placeholder. Prices are in whole rupees.
 */

export const WHATSAPP_NUMBER = '919603542595'; // +91 96035 42595, wa.me format
export const CURRENCY = '₹'; // ₹

export type MenuItem = {
  id: string;
  name: string;
  note: string;
  price: number;
};

export type DetailItem = { title: string; content: string };

export type Category = {
  id: 'treats' | 'breads' | 'cookies' | 'loaf';
  name: string;
  /** short line under the popup title */
  blurb: string;
  /** the paragraph that sits in the product band on the page */
  tagline: string;
  /** the two accordion panels in the product band */
  details: [DetailItem, DetailItem];
  items: MenuItem[];
};

export const CATEGORIES: Category[] = [
  {
    id: 'treats',
    name: 'Sweet Treats',
    blurb: 'The good stuff you swear you will share.',
    tagline:
      'The good stuff you pretend to share. Brownies, donuts and little jars of joy, baked in small batches and rarely lasting the day.',
    details: [
      {
        title: "What's inside",
        content:
          'Real butter, dark chocolate, eggs, sugar, flour. The honest kind, nothing you cannot pronounce.',
      },
      {
        title: 'Good to know',
        content:
          'Made to order in small batches. Best eaten the same day, if it survives the trip home.',
      },
    ],
    items: [
      { id: 'treats-brownie', name: 'Fudge Brownie', note: 'Dense, dark, a little dangerous.', price: 90 },
      { id: 'treats-donut', name: 'Choco Chip Donut', note: 'Glazed and generously drizzled.', price: 80 },
      { id: 'treats-jar', name: 'Red Velvet Jar', note: 'Cream cheese all the way down.', price: 150 },
      { id: 'treats-lemon', name: 'Lemon Bar', note: 'Sharp, sweet, gone too soon.', price: 85 },
    ],
  },
  {
    id: 'breads',
    name: 'Breads',
    blurb: 'Flour, water, time, not much else.',
    tagline:
      'Flour, water, time, and not much else. Slow proved loaves, soft buns and focaccia worth tearing into while it is still warm.',
    details: [
      {
        title: "What's inside",
        content:
          'Just flour, water, salt and a very well fed sourdough starter. No shortcuts hiding in there.',
      },
      {
        title: 'Good to know',
        content:
          'No preservatives, so eat it fresh or freeze it. Slice it, please do not saw it.',
      },
    ],
    items: [
      { id: 'breads-buns', name: 'Soft Milk Buns (4)', note: 'Pillowy. Pull apart. Repeat.', price: 120 },
      { id: 'breads-sourdough', name: 'Sourdough Loaf', note: 'Three days of patience, one crackly crust.', price: 220 },
      { id: 'breads-focaccia', name: 'Garlic Focaccia', note: 'Dimpled, herby, unapologetically oily.', price: 180 },
      { id: 'breads-rolls', name: 'Dinner Rolls (6)', note: 'The reason there are never leftovers.', price: 140 },
    ],
  },
  {
    id: 'cookies',
    name: 'Cookies',
    blurb: 'Baked in trays too small to last.',
    tagline:
      'Baked in trays too small to last. Crisp at the edge, soft in the middle, behaving exactly how a cookie should.',
    details: [
      {
        title: "What's inside",
        content:
          'Brown butter, proper chocolate, and a touch more salt than you would expect. That is the secret.',
      },
      {
        title: 'Good to know',
        content:
          'Boxed by the half dozen. They travel well and vanish even faster.',
      },
    ],
    items: [
      { id: 'cookies-classic', name: 'Classic Choc Chip', note: 'Crisp edge, gooey middle, no notes.', price: 60 },
      { id: 'cookies-double', name: 'Double Chocolate', note: 'For when one chocolate will not do.', price: 70 },
      { id: 'cookies-oatmeal', name: 'Oatmeal Raisin', note: 'Yes, raisins. Trust us on this.', price: 60 },
      { id: 'cookies-nutella', name: 'Nutella Stuffed', note: 'Molten centre, obviously.', price: 90 },
    ],
  },
  {
    id: 'loaf',
    name: 'Loaf Cakes',
    blurb: 'Comfort you can slice.',
    tagline:
      'Comfort you can slice. Tea cakes and babkas made for slow mornings, second helpings and the odd sneaky midnight cut.',
    details: [
      {
        title: "What's inside",
        content:
          'Real fruit, good butter, and absolutely no funny business.',
      },
      {
        title: 'Good to know',
        content:
          'Keeps three days wrapped up. Warm a slice and thank us later.',
      },
    ],
    items: [
      { id: 'loaf-babka', name: 'Caramel Babka', note: 'Swirled, buttery, faintly show off.', price: 260 },
      { id: 'loaf-banana', name: 'Banana Bread', note: 'Ripe bananas finally getting their moment.', price: 200 },
      { id: 'loaf-marble', name: 'Marble Tea Cake', note: "Coffee's oldest friend.", price: 190 },
      { id: 'loaf-lemon', name: 'Lemon Drizzle', note: 'Bright enough to fix a Monday.', price: 210 },
    ],
  },
];

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export const ITEM_BY_ID: Record<string, MenuItem> = Object.fromEntries(
  CATEGORIES.flatMap((c) => c.items).map((i) => [i.id, i]),
);

export function formatPrice(n: number): string {
  return `${CURRENCY}${n.toLocaleString('en-IN')}`;
}

/** Build the WhatsApp deep link with the order pre-filled as the message. */
export function buildWhatsAppLink(
  cart: Record<string, number>,
  name: string,
): string {
  const lines = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = ITEM_BY_ID[id];
      if (!item) return null;
      return `• ${qty}× ${item.name} (${formatPrice(item.price * qty)})`;
    })
    .filter(Boolean);

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = ITEM_BY_ID[id];
    return item ? sum + item.price * qty : sum;
  }, 0);

  const parts = [
    'Hi Jozi Bakes! I would like to order:',
    '',
    ...lines,
    '',
    `Total: ${formatPrice(total)}`,
  ];
  if (name.trim()) parts.push('', `Name: ${name.trim()}`);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    parts.join('\n'),
  )}`;
}
