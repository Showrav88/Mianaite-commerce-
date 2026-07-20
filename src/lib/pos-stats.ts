import type { MarketOrder } from '@/mock/orders'
import type { AdminProduct } from '@/lib/admin-store'
import type { SupplierDeal } from '@/lib/office-store'

/** Counter POS orders for the office shop (Mirpur demo + shop_6). */
export function filterPosOrders(orders: MarketOrder[], shopId?: string): MarketOrder[] {
  return orders.filter(o => {
    if (o.source !== 'counter') return false
    if (!shopId) return true
    return o.shopId === shopId
  })
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function sumOrderRevenue(orders: MarketOrder[]): number {
  return orders.reduce((s, o) => s + o.total, 0)
}

export function orderCogs(order: MarketOrder, products: AdminProduct[]): number {
  const byId = new Map(products.map(p => [p.id, p]))
  return order.items.reduce((s, line) => {
    const p = byId.get(line.productId)
    const cost = p?.costPrice ?? line.unitPrice * 0.65
    return s + cost * line.qty
  }, 0)
}

export function buildProductsFromDeal(deal: SupplierDeal, shopId: string): AdminProduct[] {
  return deal.items.map((line, idx) => ({
    id: `p_deal_${deal.id}_${idx}_${Date.now()}`,
    name: line.name,
    sku: line.sku,
    categoryId: line.categoryId,
    shopId,
    price: line.salePrice,
    costPrice: line.unitCost,
    stock: line.qty,
    lowStockThreshold: Math.max(5, Math.floor(line.qty * 0.1)),
    status: 'active' as const,
    image: '',
    description: `Stock-in from deal ${deal.reference}`,
    sold: 0,
  }))
}

export function groupSalesByDay(orders: MarketOrder[]): { date: string; sales: number; bills: number }[] {
  const map = new Map<string, { sales: number; bills: number }>()
  for (const o of orders) {
    const row = map.get(o.createdAt) ?? { sales: 0, bills: 0 }
    row.sales += o.total
    row.bills += 1
    map.set(o.createdAt, row)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, ...v }))
}

export function groupSalesByMonth(orders: MarketOrder[]): { month: string; sales: number; bills: number }[] {
  const map = new Map<string, { sales: number; bills: number }>()
  for (const o of orders) {
    const month = o.createdAt.slice(0, 7)
    const row = map.get(month) ?? { sales: 0, bills: 0 }
    row.sales += o.total
    row.bills += 1
    map.set(month, row)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, v]) => ({ month, ...v }))
}
