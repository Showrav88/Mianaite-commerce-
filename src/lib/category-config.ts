import { SUBCATEGORIES_BY_CATEGORY, type Subcategory } from '@/lib/admin-store'

export interface VariantOption {
  value: string
  label: string
  labelBn?: string
}

export interface VariantAttributeDef {
  key: string
  label: string
  labelBn?: string
  options: VariantOption[]
}

/** Demo variant axes per system category — kept as reference; shops opt in via details config. */
export const DEMO_VARIANT_ATTRIBUTES_BY_CATEGORY: Record<string, VariantAttributeDef[]> = {
  cat_fashion: [
    {
      key: 'size',
      label: 'Size',
      labelBn: 'সাইজ',
      options: [
        { value: 's', label: 'S', labelBn: 'এস' },
        { value: 'm', label: 'M', labelBn: 'এম' },
        { value: 'l', label: 'L', labelBn: 'এল' },
        { value: 'xl', label: 'XL' },
        { value: 'xxl', label: 'XXL' },
      ],
    },
    {
      key: 'color',
      label: 'Color',
      labelBn: 'রং',
      options: [
        { value: 'black', label: 'Black', labelBn: 'কালো' },
        { value: 'white', label: 'White', labelBn: 'সাদা' },
        { value: 'blue', label: 'Blue', labelBn: 'নীল' },
        { value: 'red', label: 'Red', labelBn: 'লাল' },
      ],
    },
  ],
  cat_electronics: [
    {
      key: 'storage',
      label: 'Storage',
      labelBn: 'স্টোরেজ',
      options: [
        { value: '64gb', label: '64 GB' },
        { value: '128gb', label: '128 GB' },
        { value: '256gb', label: '256 GB' },
      ],
    },
    {
      key: 'color',
      label: 'Color',
      labelBn: 'রং',
      options: [
        { value: 'black', label: 'Black', labelBn: 'কালো' },
        { value: 'silver', label: 'Silver', labelBn: 'সিলভার' },
      ],
    },
  ],
  cat_groceries: [
    {
      key: 'weight',
      label: 'Weight / Pack',
      labelBn: 'ওজন / প্যাক',
      options: [
        { value: '500g', label: '500 g' },
        { value: '1kg', label: '1 kg' },
        { value: '5kg', label: '5 kg' },
      ],
    },
  ],
  cat_beauty: [
    {
      key: 'volume',
      label: 'Volume',
      labelBn: 'পরিমাণ',
      options: [
        { value: '50ml', label: '50 ml' },
        { value: '100ml', label: '100 ml' },
        { value: '200ml', label: '200 ml' },
      ],
    },
  ],
  cat_kids: [
    {
      key: 'age',
      label: 'Age group',
      labelBn: 'বয়স',
      options: [
        { value: '0-2', label: '0–2 years' },
        { value: '3-5', label: '3–5 years' },
        { value: '6-12', label: '6–12 years' },
      ],
    },
  ],
  cat_sports: [
    {
      key: 'size',
      label: 'Size',
      labelBn: 'সাইজ',
      options: [
        { value: 's', label: 'S' },
        { value: 'm', label: 'M' },
        { value: 'l', label: 'L' },
      ],
    },
  ],
  cat_jewelry: [
    {
      key: 'material',
      label: 'Material',
      labelBn: 'উপাদান',
      options: [
        { value: 'gold', label: 'Gold', labelBn: 'সোনা' },
        { value: 'silver', label: 'Silver', labelBn: 'রূপা' },
        { value: 'artificial', label: 'Artificial', labelBn: 'কৃত্রিম' },
      ],
    },
  ],
}

export interface ShopCategoryConfig {
  shopId: string
  categoryId: string
  /** When false, POS uses platform demo subcategories/variants only (read-only reference). */
  detailsEnabled: boolean
  subcategories: Subcategory[]
  variantAttributes: VariantAttributeDef[]
}

export function defaultSubcategoriesForCategory(categoryId: string): Subcategory[] {
  return [...(SUBCATEGORIES_BY_CATEGORY[categoryId] ?? [])]
}

export function defaultVariantAttributesForCategory(categoryId: string): VariantAttributeDef[] {
  const raw = DEMO_VARIANT_ATTRIBUTES_BY_CATEGORY[categoryId] ?? []
  return raw.map(a => ({
    ...a,
    options: a.options.map(o => ({ ...o })),
  }))
}

export function buildDefaultShopCategoryConfig(shopId: string, categoryId: string): ShopCategoryConfig {
  return {
    shopId,
    categoryId,
    detailsEnabled: false,
    subcategories: defaultSubcategoriesForCategory(categoryId),
    variantAttributes: defaultVariantAttributesForCategory(categoryId),
  }
}

export function subcategoriesForShopCategory(config: ShopCategoryConfig): Subcategory[] {
  if (config.detailsEnabled) return config.subcategories
  return defaultSubcategoriesForCategory(config.categoryId)
}

export function variantAttributesForShopCategory(config: ShopCategoryConfig): VariantAttributeDef[] {
  if (config.detailsEnabled) return config.variantAttributes
  return defaultVariantAttributesForCategory(config.categoryId)
}
