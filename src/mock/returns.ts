export type ReturnStatus = 'pending' | 'inspecting' | 'restocked' | 'sent_to_deals' | 'written_off'

export interface MarketReturn {
  id: string
  orderId: string
  orderNumber: string
  shopId: string
  productId: string
  productName: string
  variantId: string
  variantSku: string
  variantLabel: string
  qty: number
  unitPrice: number
  reason: string
  customerName: string
  customerPhone: string
  status: ReturnStatus
  createdAt: string
  resolvedAt?: string
  dealId?: string
  inspectionNote?: string
}

export const INITIAL_RETURNS: MarketReturn[] = [
  {
    id: 'ret_001',
    orderId: 'ord_001',
    orderNumber: '1T99-240501-0001',
    shopId: 'shop_mirpur',
    productId: 'prod_casio_mq24',
    productName: 'Casio MQ-24 Classic Watch',
    variantId: 'v_mq24_blk',
    variantSku: '1T99-WCH-001-BLK',
    variantLabel: 'Black / Resin',
    qty: 1,
    unitPrice: 950,
    reason: 'Strap broke after 3 days of normal use. Stitching came undone near the buckle.',
    customerName: 'Rahim Uddin',
    customerPhone: '01711-111111',
    status: 'pending',
    createdAt: '2026-05-08',
  },
  {
    id: 'ret_002',
    orderId: 'ord_003',
    orderNumber: '1T99-240503-0003',
    shopId: 'shop_mirpur',
    productId: 'prod_ceramic_plates',
    productName: 'Ceramic Dinner Plate Set — 6pcs',
    variantId: 'v_plates_wht',
    variantSku: '1T99-CRM-001-WHT',
    variantLabel: 'White',
    qty: 1,
    unitPrice: 1200,
    reason: 'One plate arrived with a hairline crack across the centre. Rest of the set is fine.',
    customerName: 'Fatema Begum',
    customerPhone: '01811-222222',
    status: 'inspecting',
    inspectionNote: 'Confirmed — crack visible on plate #3. Other 5 plates are perfect. Packaging damage likely during shipping.',
    createdAt: '2026-05-10',
  },
  {
    id: 'ret_003',
    orderId: 'ord_006',
    orderNumber: '1T99-240508-0006',
    shopId: 'shop_mirpur',
    productId: 'prod_miyako_kettle',
    productName: 'Miyako Electric Kettle 1.8L',
    variantId: 'v_kettle_wht',
    variantSku: '1T99-KCH-003-WHT',
    variantLabel: 'White',
    qty: 1,
    unitPrice: 850,
    reason: 'Lid does not close properly — small scratch on the plastic hinge. Customer noticed after purchase.',
    customerName: 'Tariq Ahmad',
    customerPhone: '01511-555555',
    status: 'sent_to_deals',
    resolvedAt: '2026-05-14',
    dealId: 'deal_001',
    inspectionNote: 'Minor cosmetic scratch on lid hinge. Functionally perfect — boils and seals fine. Suitable for deals channel at 25% off.',
    createdAt: '2026-05-12',
  },
  {
    id: 'ret_004',
    orderId: 'ord_008',
    orderNumber: '1T99-240511-0008',
    shopId: 'shop_mirpur',
    productId: 'prod_lego_classic',
    productName: 'LEGO Classic Brick Box — 484pcs',
    variantId: 'v_lego484',
    variantSku: '1T99-TOY-002-484',
    variantLabel: 'Standard',
    qty: 1,
    unitPrice: 3500,
    reason: 'Box is opened and slightly damaged — corner torn. All 484 pieces present and accounted for (customer counted). Customer bought duplicate as gift.',
    customerName: 'Counter — Walk-in',
    customerPhone: '—',
    status: 'restocked',
    resolvedAt: '2026-05-13',
    inspectionNote: 'Verified all pieces present. Box corner torn but contents perfect. Marked as open-box and restocked at discounted counter price.',
    createdAt: '2026-05-13',
  },
  {
    id: 'ret_005',
    orderId: 'ord_010',
    orderNumber: '1T99-240513-0010',
    shopId: 'shop_mirpur',
    productId: 'prod_apex_loafer',
    productName: "Apex Men's Formal Loafer",
    variantId: 'v_apex_42',
    variantSku: '1T99-SHO-001-42',
    variantLabel: 'Size 42 / Black',
    qty: 1,
    unitPrice: 1850,
    reason: 'Sole is delaminating at the toe — glue joint failing. Worn only twice.',
    customerName: 'Mehedi Hasan',
    customerPhone: '01211-888888',
    status: 'written_off',
    resolvedAt: '2026-05-20',
    inspectionNote: 'Sole delamination confirmed — manufacturing defect. Not resaleable. Written off. Vendor complaint filed with Apex distributor.',
    createdAt: '2026-05-16',
  },
]
