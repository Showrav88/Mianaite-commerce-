import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "./products";

interface CartItem { productId: string; qty: number; }
interface CartCtx {
  items: CartItem[];
  detailedItems: (CartItem & { product: Product })[];
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "aiteshops_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const api = useMemo<CartCtx>(() => {
    const detailedItems = items
      .map((i) => ({ ...i, product: products.find((p) => p.id === i.productId)! }))
      .filter((i) => !!i.product);
    return {
      items,
      detailedItems,
      add: (productId, qty = 1) =>
        setItems((prev) => {
          const ex = prev.find((i) => i.productId === productId);
          if (ex) return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i));
          return [...prev, { productId, qty }];
        }),
      remove: (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
      setQty: (productId, qty) =>
        setItems((prev) =>
          qty <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        ),
      clear: () => setItems([]),
      count: detailedItems.reduce((s, i) => s + i.qty, 0),
      subtotal: detailedItems.reduce((s, i) => s + i.product.price * i.qty, 0),
    };
  }, [items]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
}
