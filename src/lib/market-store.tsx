import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { INITIAL_RETURNS, type MarketReturn, type ReturnStatus } from '@/mock/returns'
import { INITIAL_DEALS, type MarketDeal } from '@/mock/deals'
import type { MarketOrder } from '@/mock/orders'
import {
  addOrderToTotals,
  emptyShiftTotals,
  expectedDrawerCash,
  type PosShift,
  type PosStaffRole,
} from '@/lib/pos-shift'

interface CartItem {
  productId: string
  productName: string
  variantId: string
  variantSku: string
  variantLabel: string
  unitPrice: number
  qty: number
}

export type StartShiftInput = {
  shopId: string
  staffId: string
  staffName: string
  staffRole: PosStaffRole
  openingCash: number
}

export type EndShiftInput = {
  closingCash: number
  handoffNote?: string
}

interface MarketStoreCtx {
  returns: MarketReturn[]
  deals: MarketDeal[]
  orders: MarketOrder[]
  counterCart: CartItem[]
  currentShift: PosShift | null
  shiftHistory: PosShift[]

  updateReturnStatus: (id: string, status: ReturnStatus, extra?: Partial<MarketReturn>) => void
  addDeal: (deal: MarketDeal) => void
  updateDeal: (id: string, patch: Partial<MarketDeal>) => void
  addOrder: (order: MarketOrder) => void

  addToCounterCart: (item: CartItem) => void
  updateCounterCartQty: (variantId: string, qty: number) => void
  removeFromCounterCart: (variantId: string) => void
  clearCounterCart: () => void

  startShift: (input: StartShiftInput) => boolean
  endShiftWithCount: (input: EndShiftInput) => { ok: true; shift: PosShift } | { ok: false; reason: 'no_active_shift' }
  getActiveShift: (shopId: string) => PosShift | null
  shiftsForShop: (shopId: string) => PosShift[]
}

const Ctx = createContext<MarketStoreCtx | null>(null)

const ORDERS_KEY = '1to99_counter_orders_v1'
const ACTIVE_SHIFT_KEY = '1to99_pos_active_shift_v1'
const SHIFT_HISTORY_KEY = '1to99_pos_shift_history_v1'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

function migrateLegacyShift(raw: unknown): PosShift | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.startedAt !== 'string') return null
  if (typeof o.shopId === 'string' && o.totals) return raw as PosShift
  const cashier = typeof o.cashier === 'string' ? o.cashier : 'Staff'
  const orders = Array.isArray(o.orders) ? (o.orders as string[]) : []
  return {
    id: o.id,
    shopId: 'shop_6',
    staffId: 'legacy',
    staffName: cashier,
    staffRole: 'staff',
    startedAt: o.startedAt,
    endedAt: typeof o.endedAt === 'string' ? o.endedAt : undefined,
    openingCash: typeof o.openingCash === 'number' ? o.openingCash : 0,
    orderIds: orders,
    totals: emptyShiftTotals(),
  }
}

export function MarketStoreProvider({ children }: { children: ReactNode }) {
  const [returns, setReturns] = useState<MarketReturn[]>(() =>
    load('market_returns_v1', INITIAL_RETURNS)
  )
  const [deals, setDeals] = useState<MarketDeal[]>(() =>
    load('market_deals_v1', INITIAL_DEALS)
  )
  const [orders, setOrders] = useState<MarketOrder[]>(() =>
    load(ORDERS_KEY, [] as MarketOrder[])
  )
  const [counterCart, setCounterCart] = useState<CartItem[]>([])
  const [currentShift, setCurrentShift] = useState<PosShift | null>(() => {
    const loaded = load(ACTIVE_SHIFT_KEY, null as PosShift | null)
    if (loaded) return loaded
    const legacy = localStorage.getItem('market_counter_v1')
    if (legacy) return migrateLegacyShift(JSON.parse(legacy))
    return null
  })
  const [shiftHistory, setShiftHistory] = useState<PosShift[]>(() =>
    load(SHIFT_HISTORY_KEY, [] as PosShift[])
  )

  useEffect(() => { save('market_returns_v1', returns) }, [returns])
  useEffect(() => { save('market_deals_v1', deals) }, [deals])
  useEffect(() => { save(ORDERS_KEY, orders) }, [orders])
  useEffect(() => { save(ACTIVE_SHIFT_KEY, currentShift) }, [currentShift])
  useEffect(() => { save(SHIFT_HISTORY_KEY, shiftHistory) }, [shiftHistory])

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
    setCurrentShift(prev => {
      if (!prev || prev.endedAt) return prev
      if (order.shopId !== prev.shopId) return prev
      return {
        ...prev,
        orderIds: [...prev.orderIds, order.id],
        totals: addOrderToTotals(prev.totals, order),
      }
    })
  }, [])

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

  const startShift = useCallback((input: StartShiftInput): boolean => {
    let started = false
    setCurrentShift(prev => {
      if (prev && !prev.endedAt && prev.shopId === input.shopId) return prev
      started = true
      return {
        id: `shift_${Date.now()}`,
        shopId: input.shopId,
        staffId: input.staffId,
        staffName: input.staffName,
        staffRole: input.staffRole,
        startedAt: new Date().toISOString(),
        openingCash: Math.max(0, input.openingCash),
        orderIds: [],
        totals: emptyShiftTotals(),
      }
    })
    return started
  }, [])

  const endShiftWithCount = useCallback((input: EndShiftInput) => {
    let closed: PosShift | null = null
    setCurrentShift(prev => {
      if (!prev || prev.endedAt) return prev
      const expected = expectedDrawerCash(prev)
      const closing = Math.max(0, input.closingCash)
      closed = {
        ...prev,
        endedAt: new Date().toISOString(),
        closingCash: closing,
        expectedCash: expected,
        cashVariance: closing - expected,
        handoffNote: input.handoffNote?.trim() || undefined,
      }
      return null
    })
    if (!closed) return { ok: false as const, reason: 'no_active_shift' as const }
    setShiftHistory(h => [closed!, ...h])
    return { ok: true as const, shift: closed }
  }, [])

  const getActiveShift = useCallback((shopId: string) => {
    if (!currentShift || currentShift.endedAt) return null
    return currentShift.shopId === shopId ? currentShift : null
  }, [currentShift])

  const shiftsForShop = useCallback((shopId: string) => {
    const active = currentShift && !currentShift.endedAt && currentShift.shopId === shopId
      ? [currentShift]
      : []
    const past = shiftHistory.filter(s => s.shopId === shopId)
    return [...active, ...past]
  }, [currentShift, shiftHistory])

  return (
    <Ctx.Provider value={{
      returns, deals, orders, counterCart, currentShift, shiftHistory,
      updateReturnStatus, addDeal, updateDeal, addOrder,
      addToCounterCart, updateCounterCartQty, removeFromCounterCart, clearCounterCart,
      startShift, endShiftWithCount, getActiveShift, shiftsForShop,
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

export type { CartItem, PosShift as CounterShift }

export { expectedDrawerCash, shiftDurationMinutes } from '@/lib/pos-shift'
