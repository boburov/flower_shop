"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/types";

export interface BasketItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
}

interface BasketContextValue {
  items: BasketItem[];
  count: number;
  subtotal: number;
  /** True once we've read localStorage, so the UI can avoid hydration flashes. */
  hydrated: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "bloome.basket.v1";
const BasketContext = createContext<BasketContextValue | null>(null);

function toItem(product: Product, quantity: number): BasketItem {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    currency: product.currency,
    imageUrl: product.imageUrl,
    quantity,
  };
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const didHydrate = useRef(false);

  // Load persisted basket once, after mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter(isValidItem));
      }
    } catch {
      // Ignore corrupt / unavailable storage; start with an empty basket.
    } finally {
      didHydrate.current = true;
      setHydrated(true);
    }
  }, []);

  // Persist after every change (but not on the initial hydration read).
  useEffect(() => {
    if (!didHydrate.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be full or blocked (private mode) — fail silently.
    }
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, toItem(product, quantity)];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
  }, []);

  const increment = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)));
  }, []);

  const decrement = useCallback((id: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<BasketContextValue>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
    return {
      items,
      count,
      subtotal,
      hydrated,
      addItem,
      removeItem,
      setQuantity,
      increment,
      decrement,
      clear,
    };
  }, [items, hydrated, addItem, removeItem, setQuantity, increment, decrement, clear]);

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

function isValidItem(i: unknown): i is BasketItem {
  return (
    typeof i === "object" &&
    i !== null &&
    typeof (i as BasketItem).id === "string" &&
    typeof (i as BasketItem).price === "number" &&
    typeof (i as BasketItem).quantity === "number"
  );
}

export function useBasket(): BasketContextValue {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used within a BasketProvider");
  return ctx;
}
