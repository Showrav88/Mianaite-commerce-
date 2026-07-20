export type LabelFieldKey =
  | 'shopName'
  | 'productName'
  | 'sizeLine'
  | 'sku'
  | 'price'
  | 'barcode'
  | 'qrCode'
  | 'shopCode'

export interface LabelFieldConfig {
  shopName: boolean
  productName: boolean
  sizeLine: boolean
  sku: boolean
  price: boolean
  barcode: boolean
  qrCode: boolean
  shopCode: boolean
}

export interface LabelStyleConfig {
  primaryColor: string
  headerBand: boolean
  copiesPerProduct: number
}

export const DEFAULT_LABEL_FIELDS: LabelFieldConfig = {
  shopName: true,
  productName: true,
  sizeLine: true,
  sku: true,
  price: true,
  barcode: true,
  qrCode: true,
  shopCode: false,
}

export const DEFAULT_LABEL_STYLE: LabelStyleConfig = {
  primaryColor: '#f97316',
  headerBand: true,
  copiesPerProduct: 1,
}

const FIELDS_KEY = '1to99_label_fields_v1'
const STYLE_KEY = '1to99_label_style_v1'

export function loadLabelFields(): LabelFieldConfig {
  try {
    const raw = localStorage.getItem(FIELDS_KEY)
    if (!raw) return { ...DEFAULT_LABEL_FIELDS }
    return { ...DEFAULT_LABEL_FIELDS, ...(JSON.parse(raw) as Partial<LabelFieldConfig>) }
  } catch {
    return { ...DEFAULT_LABEL_FIELDS }
  }
}

export function saveLabelFields(cfg: LabelFieldConfig) {
  try { localStorage.setItem(FIELDS_KEY, JSON.stringify(cfg)) } catch { /* ignore */ }
}

export function loadLabelStyle(): LabelStyleConfig {
  try {
    const raw = localStorage.getItem(STYLE_KEY)
    if (!raw) return { ...DEFAULT_LABEL_STYLE }
    return { ...DEFAULT_LABEL_STYLE, ...(JSON.parse(raw) as Partial<LabelStyleConfig>) }
  } catch {
    return { ...DEFAULT_LABEL_STYLE }
  }
}

export function saveLabelStyle(cfg: LabelStyleConfig) {
  try { localStorage.setItem(STYLE_KEY, JSON.stringify(cfg)) } catch { /* ignore */ }
}

/** Payload for counter / scanner (SKU-first). */
export function labelQrPayload(sku: string): string {
  return sku.trim()
}

export function qrImageUrl(data: string, px = 120): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${px}x${px}&margin=1&data=${encodeURIComponent(data)}`
}
