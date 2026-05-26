import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { INITIAL_RETURNS, type MarketReturn, type ReturnStatus } from '@/mock/returns'
import { INITIAL_DEALS, type MarketDeal } from '@/mock/deals'
import { MARKET_ORDERS, type MarketOrder } from '@/mock/orders'

interface CartItem {
  productId: string
  productName: string
  variantId: string
  variantSku: string
  variantLabel: string
  unitPrice: number
  qty: number
}

interface CounterShift {
  id: string
  cashier: string
  startedAt: string
  endedAt?: string
  openingCash: number
  orders: string[]
}

interface MarketStoreCtx {
  returns: MarketReturn[]
  deals: MarketDeal[]
  orders: MarketOrder[]
  counterCart: CartItem[]
  currentShift: CounterShift | null

  updateReturnStatus: (id: string, status: ReturnStatus, extra?: Partial<MarketReturn>) => void
  addDeal: (deal: MarketDeal) => void
  updateDeal: (id: string, patch: Partial<MarketDeal>) => void
  addOrder: (order: MarketOrder) => void

  addToCounterCart: (item: CartItem) => void
  updateCounterCartQty: (variantId: string, qty: number) => void
  removeFromCounterCart: (variantId: string) => void
  clearCounterCart: () => void

  startShift: (cashier: string, openingCash: number) => void
  endShift: () => void
}

const Ctx = createContext<MarketStoreCtx | null>(null)

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore quota errors */ }
}

export function MarketStoreProvider({ children }: { children: ReactNode }) {
  const [returns, setReturns] = useState<MarketReturn[]>(() =>
    load('market_returns_v1', INITIAL_RETURNS)
  )
  const [deals, setDeals] = useState<MarketDeal[]>(() =>
    load('market_deals_v1', INITIAL_DEALS)
  )
  const [orders, setOrders] = useState<MarketOrder[]>(() =>
    load('market_orders_v1', MARKET_ORDERS)
  )
  const [counterCart, setCounterCart] = useState<CartItem[]>([])
  const [currentShift, setCurrentShift] = useState<CounterShift | null>(() =>
    load('market_counter_v1', null)
  )

  useEffect(() => { save('market_returns_v1', returns) }, [returns])
  useEffect(() => { save('market_deals_v1', deals) }, [deals])
  useEffect(() => { save('market_orders_v1', orders) }, [orders])
  useEffect(() => { save('market_counter_v1', currentShift) }, [currentShift])

  const updateReturnStatus = useCallback((id: string, status: ReturnStatus, extra: Partial<MarketReturn> = {}) => {
    setReturns(prev => prev.map(r => r.id === id
      ? { ...r, status, ...extra, resolvedAt: status !== 'pending' && status !== 'inspecting' ? new Date().toISOString().slice(0, 10) : r.resolvedAt }
      : r
    ))
  }, [])

  const addDeal = useCallback((deal: MarketDeal) => {
    setDeals(prev => [deal, ...prev])
  }, [])

  const updateDeal = useCallback((id: string, patch: Partial<MarketDeal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d))
  }, [])

  const addOrder = useCallback((order: MarketOrder) => {
    setOrders(prev => [order, ...prev])
    if (currentShift) {
      setCurrentShift(prev => prev ? { ...prev, orders: [...prev.orders, order.id] } : prev)
    }
  }, [currentShift])

  const addToCounterCart = useCallback((item: CartItem) => {
    setCounterCart(prev => {
      const existing = prev.find(i => i.variantId === item.variantId)
      if (existing) return prev.map(i => i.variantId === item.variantId ? { ...i, qty: i.qty + item.qty } : i)
      return [...prev, item]
    })
  }, [])

  const updateCounterCartQty = useCallback((variantId: string, qty: number) => {
    if (qty <= 0) {
      setCounterCart(prev => prev.filter(i => i.variantId !== variantId))
    } else {
      setCounterCart(prev => prev.map(i => i.variantId === variantId ? { ...i, qty } : i))
    }
  }, [])

  const removeFromCounterCart = useCallback((variantId: string) => {
    setCounterCart(prev => prev.filter(i => i.variantId !== variantId))
  }, [])

  const clearCounterCart = useCallback(() => setCounterCart([]), [])

  const startShift = useCallback((cashier: string, openingCash: number) => {
    setCurrentShift({
      id: `shift_${Date.now()}`,
      cashier,
      startedAt: new Date().toISOString(),
      openingCash,
      orders: [],
    })
  }, [])

  const endShift = useCallback(() => {
    setCurrentShift(prev => prev ? { ...prev, endedAt: new Date().toISOString() } : null)
  }, [])

  return (
    <Ctx.Provider value={{
      returns, deals, orders, counterCart, currentShift,
      updateReturnStatus, addDeal, updateDeal, addOrder,
      addToCounterCart, updateCounterCartQty, removeFromCounterCart, clearCounterCart,
      startShift, endShift,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useMarketStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMarketStore must be used inside MarketStoreProvider')
  return ctx
}

export type { CartItem, CounterShift }
