import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface ShopCartItem {
  productId: string
  shopId: string
  name: string
  price: number
  image: string
  qty: number
}

interface ShopCartCtx {
  items: ShopCartItem[]
  currentShopId: string | null
  addItem: (item: Omit<ShopCartItem, 'qty'>) => 'added' | 'shop_conflict'
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clear: () => void
  forceAddFromShop: (item: Omit<ShopCartItem, 'qty'>) => void
  count: number
  total: number
}

const Ctx = createContext<ShopCartCtx>({
  items: [], currentShopId: null,
  addItem: () => 'added', removeItem: () => {}, updateQty: () => {}, clear: () => {}, forceAddFromShop: () => {},
  count: 0, total: 0,
})

const CART_KEY = 'shop_cart_v1'

function loadCart(): { items: ShopCartItem[]; currentShopId: string | null } {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return { items: [], currentShopId: null }
    return JSON.parse(raw)
  } catch {
    return { items: [], currentShopId: null }
  }
}

export function ShopCartProvider({ children }: { children: ReactNode }) {
  const initial = loadCart()
  const [items, setItems] = useState<ShopCartItem[]>(initial.items)
  const [currentShopId, setCurrentShopId] = useState<string | null>(initial.currentShopId)

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify({ items, currentShopId })) } catch {}
  }, [items, currentShopId])

  function addItem(item: Omit<ShopCartItem, 'qty'>): 'added' | 'shop_conflict' {
    if (currentShopId && currentShopId !== item.shopId && items.length > 0) return 'shop_conflict'
    setCurrentShopId(item.shopId)
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) return prev.map(i => i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
    return 'added'
  }

  function forceAddFromShop(item: Omit<ShopCartItem, 'qty'>) {
    const next = [{ ...item, qty: 1 }]
    setItems(next)
    setCurrentShopId(item.shopId)
  }

  function removeItem(productId: string) {
    setItems(prev => {
      const next = prev.filter(i => i.productId !== productId)
      if (next.length === 0) setCurrentShopId(null)
      return next
    })
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) { removeItem(productId); return }
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, qty } : i))
  }

  function clear() { setItems([]); setCurrentShopId(null) }

  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <Ctx.Provider value={{ items, currentShopId, addItem, removeItem, updateQty, clear, forceAddFromShop, count, total }}>
      {children}
    </Ctx.Provider>
  )
}

export const useShopCart = () => useContext(Ctx)
