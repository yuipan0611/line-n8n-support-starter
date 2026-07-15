"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { useCatalog } from "@/components/catalog-context";
import { calculateDeliveryFee, resolveDeliveryRule } from "@/lib/delivery";
import { readCustomer } from "@/lib/storage";
import type { CartItem, DeliveryRule, Product } from "@/lib/types";

type CartLine = CartItem & {
  product: Product;
  lineTotal: number;
};

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  deliveryFee: number;
  deliveryRule: DeliveryRule | null;
  freeShippingRemaining: number;
  total: number;
  addItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const cartKey = "fruit-liff-cart";
const cartUpdatedEvent = "fruit-liff-cart-updated";
const emptyCartSnapshot = "[]";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { products, deliveryRules } = useCatalog();
  const cartSnapshot = useSyncExternalStore(subscribeCart, getCartSnapshot, getServerCartSnapshot);
  const items = useMemo(() => parseCartSnapshot(cartSnapshot), [cartSnapshot]);

  const value = useMemo<CartContextValue>(() => {
    const lines = items
      .map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product) return null;
        return { ...item, product, lineTotal: product.price * item.quantity };
      })
      .filter(Boolean) as CartLine[];

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const deliveryRule =
      deliveryRules.length > 0 ? resolveDeliveryRule(readCustomer().address, deliveryRules) : null;
    const deliveryFee = deliveryRule ? calculateDeliveryFee(subtotal, deliveryRule) : 0;
    const freeShippingRemaining = deliveryRule
      ? subtotal > 0
        ? Math.max(deliveryRule.freeShippingThreshold - subtotal, 0)
        : deliveryRule.freeShippingThreshold
      : 0;

    return {
      items,
      lines,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      deliveryFee,
      deliveryRule,
      freeShippingRemaining,
      total: subtotal + deliveryFee,
      addItem: (productId) => {
        updateCart((current) => {
          const existing = current.find((item) => item.productId === productId);
          if (existing) {
            return current.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          }
          return [...current, { productId, quantity: 1 }];
        });
      },
      decrementItem: (productId) => {
        updateCart((current) =>
          current.flatMap((item) => {
            if (item.productId !== productId) return [item];
            if (item.quantity <= 1) return [];
            return [{ ...item, quantity: item.quantity - 1 }];
          }),
        );
      },
      removeItem: (productId) => {
        updateCart((current) => current.filter((item) => item.productId !== productId));
      },
      clearCart: () => updateCart(() => []),
    };
  }, [deliveryRules, items, products]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

function subscribeCart(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(cartUpdatedEvent, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(cartUpdatedEvent, listener);
  };
}

function getCartSnapshot() {
  return window.localStorage.getItem(cartKey) || emptyCartSnapshot;
}

function getServerCartSnapshot() {
  return emptyCartSnapshot;
}

function parseCartSnapshot(snapshot: string): CartItem[] {
  try {
    return JSON.parse(snapshot) as CartItem[];
  } catch {
    return [];
  }
}

function updateCart(updater: (items: CartItem[]) => CartItem[]) {
  const nextItems = updater(parseCartSnapshot(getCartSnapshot()));
  window.localStorage.setItem(cartKey, JSON.stringify(nextItems));
  window.dispatchEvent(new Event(cartUpdatedEvent));
}
