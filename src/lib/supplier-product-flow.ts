import type { SupplierDeal, SupplierDealLine } from '@/lib/office-store'

/** Fields aligned with admin products form (string inputs). */
export type SupplierProductFormPrefill = {
  name: string
  sku: string
  description: string
  categoryId: string
  costPrice: string
  price: string
  stock: string
  lowStockThreshold: string
}

export function productFormFromDealLine(
  line: SupplierDealLine,
  reference: string,
  supplierName: string,
): SupplierProductFormPrefill {
  const qty = line.qty > 0 ? line.qty : 1
  return {
    name: line.name.trim(),
    sku: line.sku.trim(),
    categoryId: line.categoryId || '',
    costPrice: line.unitCost != null ? String(line.unitCost) : '',
    price: line.salePrice != null ? String(line.salePrice) : '',
    stock: String(qty),
    lowStockThreshold: String(Math.max(5, Math.floor(qty * 0.1))),
    description: supplierName
      ? `Stock from ${supplierName} · PO ${reference}`
      : `Stock-in from deal ${reference}`,
  }
}

/** Any deal with line items can open the product form with prefilled fields. */
export function dealSupportsProductPrefill(deal: SupplierDeal): boolean {
  return deal.items.some(it => it.name.trim() && it.sku.trim())
}

export function firstIncompleteDealLineIndex(deal: SupplierDeal): number {
  const byLine = deal.productIdsByLine
  if (!byLine?.length) return 0
  for (let i = 0; i < deal.items.length; i++) {
    if (!byLine[i]) return i
  }
  return -1
}

export function dealProductsProgress(deal: SupplierDeal): { done: number; total: number } {
  const total = deal.items.filter(it => it.name.trim() && it.sku.trim()).length
  const byLine = deal.productIdsByLine ?? []
  const done = deal.items.reduce((n, it, i) => {
    if (!it.name.trim() || !it.sku.trim()) return n
    return byLine[i] ? n + 1 : n
  }, 0)
  return { done, total }
}

export function allDealLinesHaveProducts(deal: SupplierDeal): boolean {
  const { done, total } = dealProductsProgress(deal)
  return total > 0 && done >= total
}
