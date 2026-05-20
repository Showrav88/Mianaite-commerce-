import type { AdminProduct } from './admin-store'

export function shopProductPageUrl(shopSlug: string, productId: string): string {
  return `/shop/${shopSlug}/product/${productId}`
}

export function openProductForSale(shopSlug: string, productId: string): void {
  window.open(shopProductPageUrl(shopSlug, productId), '_blank')
}

export function resolveProductFromScan(sku: string, products: AdminProduct[]): AdminProduct | null {
  const term = sku.trim().toLowerCase()
  return products.find(p => p.sku.toLowerCase() === term || p.name.toLowerCase().includes(term)) ?? null
}
