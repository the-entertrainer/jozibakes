/**
 * Jozi Bakes menu — placeholder catalogue for the ordering flow. Prices in ₹
 * (home bakery, Kharghar / Navi Mumbai). Edit freely; the UI is data-driven.
 */

export const CURRENCY = '₹';

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  note?: string;
};

export type Category = {
  id: string;
  label: string;
  emoji: string;
  items: MenuItem[];
};

export const MENU: Category[] = [
  {
    id: 'cakes',
    label: 'Cakes',
    emoji: '🎂',
    items: [
      { id: 'cake-vanilla', name: 'Classic Vanilla Bean', price: 750, emoji: '🍰', note: '500g' },
      { id: 'cake-chocolate', name: 'Belgian Chocolate', price: 850, emoji: '🍫', note: '500g' },
      { id: 'cake-redvelvet', name: 'Red Velvet', price: 900, emoji: '❤️', note: '500g' },
      { id: 'cake-biscoff', name: 'Biscoff Dream', price: 950, emoji: '🍯', note: '500g' },
    ],
  },
  {
    id: 'brownies',
    label: 'Brownies',
    emoji: '🟫',
    items: [
      { id: 'brownie-fudge', name: 'Fudgy Classic', price: 90, emoji: '🍫', note: 'each' },
      { id: 'brownie-walnut', name: 'Walnut Brownie', price: 110, emoji: '🌰', note: 'each' },
      { id: 'brownie-blondie', name: 'Salted Blondie', price: 100, emoji: '🍪', note: 'each' },
    ],
  },
  {
    id: 'cookies',
    label: 'Cookies',
    emoji: '🍪',
    items: [
      { id: 'cookie-choco', name: 'Choco Chip', price: 60, emoji: '🍪', note: 'each' },
      { id: 'cookie-double', name: 'Double Chocolate', price: 70, emoji: '🍫', note: 'each' },
      { id: 'cookie-oat', name: 'Oatmeal Raisin', price: 65, emoji: '🌾', note: 'each' },
    ],
  },
  {
    id: 'cupcakes',
    label: 'Cupcakes',
    emoji: '🧁',
    items: [
      { id: 'cup-vanilla', name: 'Vanilla Swirl', price: 80, emoji: '🧁', note: 'each' },
      { id: 'cup-chocolate', name: 'Chocolate Ganache', price: 90, emoji: '🍫', note: 'each' },
      { id: 'cup-redvelvet', name: 'Red Velvet', price: 95, emoji: '❤️', note: 'each' },
    ],
  },
];

/** Flat lookup so the cart can resolve an item by id without walking categories. */
export const ITEM_BY_ID: Record<string, MenuItem> = Object.fromEntries(
  MENU.flatMap((c) => c.items).map((i) => [i.id, i]),
);
