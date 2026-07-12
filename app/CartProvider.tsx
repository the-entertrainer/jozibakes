'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { CATEGORIES, ITEM_BY_ID } from './menuData';
import OrderMenu from './OrderMenu';
import CartDrawer from './CartDrawer';
import FloatingCart from './FloatingCart';

const STORAGE_KEY = 'jozi-cart-v1';

type Cart = Record<string, number>;

type CartCtx = {
  cart: Cart;
  count: number;
  subtotal: number;
  /** id of the category whose order popup is open, or null */
  menuCategory: string | null;
  cartOpen: boolean;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  openMenu: (categoryId?: string) => void;
  closeMenu: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [menuCategory, setMenuCategory] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load any saved cart once, on mount. Guarded so an old/garbage payload or
  // a since-removed product id can never wedge the whole component.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Cart;
        const clean: Cart = {};
        for (const [id, qty] of Object.entries(parsed)) {
          if (ITEM_BY_ID[id] && typeof qty === 'number' && qty > 0) {
            clean[id] = Math.floor(qty);
          }
        }
        setCart(clean);
      }
    } catch {
      /* ignore a corrupt payload — start with an empty cart */
    }
    setHydrated(true);
  }, []);

  // Persist on every change (but not before the initial load has run, or
  // we'd clobber the saved cart with the empty starting state).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* storage full or blocked (private mode) — cart just won't persist */
    }
  }, [cart, hydrated]);

  // Lock body scroll whenever either overlay is open.
  useEffect(() => {
    const anyOpen = menuCategory !== null || cartOpen;
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuCategory, cartOpen]);

  const add = useCallback((id: string) => {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  }, []);

  const clear = useCallback(() => setCart({}), []);

  const openMenu = useCallback((categoryId?: string) => {
    setMenuCategory(categoryId ?? CATEGORIES[0].id);
    setCartOpen(false);
  }, []);
  const closeMenu = useCallback(() => setMenuCategory(null), []);
  const openCart = useCallback(() => {
    setCartOpen(true);
    setMenuCategory(null);
  }, []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const [id, qty] of Object.entries(cart)) {
      count += qty;
      const item = ITEM_BY_ID[id];
      if (item) subtotal += item.price * qty;
    }
    return { count, subtotal };
  }, [cart]);

  const value: CartCtx = {
    cart,
    count,
    subtotal,
    menuCategory,
    cartOpen,
    add,
    setQty,
    remove,
    clear,
    openMenu,
    closeMenu,
    openCart,
    closeCart,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <OrderMenu />
      <CartDrawer />
      <FloatingCart />
    </Ctx.Provider>
  );
}
