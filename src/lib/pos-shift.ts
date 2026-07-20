import type { MarketOrder } from '@/mock/orders'

export type PosStaffRole = 'owner' | 'manager' | 'staff'

export interface PosShiftTotals {
  bills: number
  revenue: number
  cash: number
  card: number
  bkash: number
  nagad: number
  other: number
}

export interface PosShift {
  id: string
  shopId: string
  staffId: string
  staffName: string
  staffRole: PosStaffRole
  startedAt: string
  endedAt?: string
  openingCash: number
  /** Counted cash in drawer when shift ended. */
  closingCash?: number
  expectedCash?: number
  cashVariance?: number
  handoffNote?: string
  orderIds: string[]
  totals: PosShiftTotals
}

export function emptyShiftTotals(): PosShiftTotals {
  return { bills: 0, revenue: 0, cash: 0, card: 0, bkash: 0, nagad: 0, other: 0 }
}

export function addOrderToTotals(totals: PosShiftTotals, order: MarketOrder): PosShiftTotals {
  const next = { ...totals, bills: totals.bills + 1, revenue: totals.revenue + order.total }
  const method = order.paymentMethod
  if (method === 'cash') next.cash += order.total
  else if (method === 'card') next.card += order.total
  else if (method === 'bkash') next.bkash += order.total
  else if (method === 'nagad') next.nagad += order.total
  else next.other += order.total
  return next
}

/** Cash that should be in drawer = opening float + cash sales this shift. */
export function expectedDrawerCash(shift: PosShift): number {
  return shift.openingCash + shift.totals.cash
}

export function shiftDurationMinutes(shift: PosShift, now = Date.now()): number {
  const start = new Date(shift.startedAt).getTime()
  const end = shift.endedAt ? new Date(shift.endedAt).getTime() : now
  return Math.max(0, Math.round((end - start) / 60000))
}

export function lastClosedShiftForShop(history: PosShift[], shopId: string): PosShift | undefined {
  return history.find(s => s.shopId === shopId && s.endedAt && s.closingCash != null)
}
