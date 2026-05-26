export interface MarketDeal {
  id: string
  shopId: string
  shopSlug: string
  productId: string
  productName: string
  productSlug: string
  variantId: string
  variantLabel: string
  images: string[]
  originalPrice: number
  dealPrice: number
  discountPercent: number
  defectNote: string
  active: boolean
  createdAt: string
  sourceReturnId?: string
}

const img = (text: string, bg = 'e8e8e8', fg = '555555') =>
  `https://placehold.co/400x320/${bg}/${fg}?text=${encodeURIComponent(text)}`

export const INITIAL_DEALS: MarketDeal[] = [
  {
    id: 'deal_001',
    shopId: 'shop_mirpur',
    shopSlug: '1to99-market-dhaka-mirpur-tw3k9p',
    productId: 'prod_miyako_kettle',
    productName: 'Miyako Electric Kettle 1.8L',
    productSlug: 'miyako-electric-kettle-1-8l',
    variantId: 'v_kettle_wht',
    variantLabel: 'White',
    images: [img('Miyako Kettle', 'f0f5f0', '333')],
    originalPrice: 850,
    dealPrice: 638,
    discountPercent: 25,
    defectNote: 'Small cosmetic scratch on lid hinge — plastic only, not metal. Does not affect boiling or sealing. Fully functional.',
    active: true,
    createdAt: '2026-05-14',
    sourceReturnId: 'ret_003',
  },
  {
    id: 'deal_002',
    shopId: 'shop_mirpur',
    shopSlug: '1to99-market-dhaka-mirpur-tw3k9p',
    productId: 'prod_glass_vase',
    productName: 'Crystal Glass Flower Vase — 30cm',
    productSlug: 'crystal-glass-flower-vase-30cm',
    variantId: 'v_vase',
    variantLabel: 'Crystal',
    images: [img('Glass Vase', 'e8f5f8', '446')],
    originalPrice: 750,
    dealPrice: 600,
    discountPercent: 20,
    defectNote: 'Original gift box missing — vase itself is perfect, zero chips or scratches. Ideal if you don\'t need the packaging.',
    active: true,
    createdAt: '2026-05-16',
  },
  {
    id: 'deal_003',
    shopId: 'shop_mirpur',
    shopSlug: '1to99-market-dhaka-mirpur-tw3k9p',
    productId: 'prod_ceramic_plates',
    productName: 'Ceramic Dinner Plate Set — 5pcs',
    productSlug: 'ceramic-dinner-plate-set-6pcs',
    variantId: 'v_plates_wht',
    variantLabel: 'White (5-piece)',
    images: [img('Ceramic Plates 5pc', 'f8f8f0', '444')],
    originalPrice: 1200,
    dealPrice: 780,
    discountPercent: 35,
    defectNote: 'One plate from a 6-piece set arrived cracked and removed. Remaining 5 plates are flawless. Sold as a 5-piece set.',
    active: true,
    createdAt: '2026-05-18',
    sourceReturnId: 'ret_002',
  },
]
