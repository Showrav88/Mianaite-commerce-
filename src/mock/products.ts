export interface ProductVariant {
  id: string
  sku: string
  attributes: Record<string, string>
  price: number
  cost: number
  stock: number
  active: boolean
}

export interface MarketProduct {
  id: string
  name: string
  slug: string
  categoryId: string
  subcategoryId: string
  description: string
  images: string[]
  variants: ProductVariant[]
  status: 'active' | 'draft' | 'archived'
  shopId: string
  createdAt: string
}

export const fmt = (n: number) => `৳${n.toLocaleString('en-BD')}`

const img = (text: string, bg = 'e8e8e8', fg = '555555') =>
  `https://placehold.co/400x320/${bg}/${fg}?text=${encodeURIComponent(text)}`

export const MARKET_PRODUCTS: MarketProduct[] = [
  // ── WATCHES ──────────────────────────────────────────
  {
    id: 'prod_casio_mq24',
    name: 'Casio MQ-24 Classic Watch',
    slug: 'casio-mq-24-classic-watch',
    categoryId: 'cat_watches',
    subcategoryId: 'sub_analog',
    description: 'The iconic Casio MQ-24 with a clean analog face and durable resin strap. Water resistant to 30m. Powered by a quartz movement — accurate to ±15 seconds per month.',
    images: [img('Casio MQ-24', 'f5f0e8', '333')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-10',
    variants: [
      { id: 'v_mq24_blk', sku: '1T99-WCH-001-BLK', attributes: { dial_color: 'black', strap_material: 'resin' }, price: 950, cost: 600, stock: 18, active: true },
      { id: 'v_mq24_wht', sku: '1T99-WCH-001-WHT', attributes: { dial_color: 'white', strap_material: 'resin' }, price: 950, cost: 600, stock: 12, active: true },
    ],
  },
  {
    id: 'prod_casio_f91w',
    name: 'Casio F-91W Digital Watch',
    slug: 'casio-f91w-digital-watch',
    categoryId: 'cat_watches',
    subcategoryId: 'sub_digital',
    description: 'The legendary Casio F-91W. Digital display, stopwatch, alarm, 7-year battery life. Water resistant to 30m.',
    images: [img('Casio F-91W', 'e8f0f5', '333')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-12',
    variants: [
      { id: 'v_f91w_blk', sku: '1T99-WCH-002-BLK', attributes: { dial_color: 'black', strap_material: 'resin', water_resistance: '30m' }, price: 1100, cost: 720, stock: 25, active: true },
      { id: 'v_f91w_gld', sku: '1T99-WCH-002-GLD', attributes: { dial_color: 'gold', strap_material: 'stainless_steel', water_resistance: '30m' }, price: 1350, cost: 870, stock: 8, active: true },
    ],
  },
  {
    id: 'prod_qq_analog',
    name: 'Q&Q Analog Watch — Stainless Steel',
    slug: 'qq-analog-watch-stainless-steel',
    categoryId: 'cat_watches',
    subcategoryId: 'sub_analog',
    description: 'Classic Japanese movement. Stainless steel case and mesh strap. Ideal everyday dress watch.',
    images: [img('Q&Q Watch', 'd8d8c8', '333')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-15',
    variants: [
      { id: 'v_qq_slv', sku: '1T99-WCH-003-SLV', attributes: { dial_color: 'silver', strap_material: 'stainless_steel', water_resistance: '30m' }, price: 1850, cost: 1100, stock: 10, active: true },
      { id: 'v_qq_gld', sku: '1T99-WCH-003-GLD', attributes: { dial_color: 'gold', strap_material: 'stainless_steel', water_resistance: '30m' }, price: 2050, cost: 1200, stock: 6, active: true },
      { id: 'v_qq_blk', sku: '1T99-WCH-003-BLK', attributes: { dial_color: 'black', strap_material: 'leather', water_resistance: '30m' }, price: 1950, cost: 1150, stock: 7, active: true },
    ],
  },

  // ── STATIONERY ────────────────────────────────────────
  {
    id: 'prod_pilot_v5',
    name: 'Pilot V5 Hi-Tecpoint Pen',
    slug: 'pilot-v5-hi-tecpoint-pen',
    categoryId: 'cat_stationery',
    subcategoryId: 'sub_pens',
    description: 'Japan\'s best-selling liquid ink rollerball. Consistent 0.5mm line, no skipping. Ideal for exams and office use.',
    images: [img('Pilot V5', 'f0f0ff', '333')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-08',
    variants: [
      { id: 'v_v5_blu', sku: '1T99-STN-001-BLU', attributes: { color: 'Blue' }, price: 110, cost: 65, stock: 120, active: true },
      { id: 'v_v5_blk', sku: '1T99-STN-001-BLK', attributes: { color: 'Black' }, price: 110, cost: 65, stock: 95, active: true },
      { id: 'v_v5_red', sku: '1T99-STN-001-RED', attributes: { color: 'Red' }, price: 110, cost: 65, stock: 60, active: true },
    ],
  },
  {
    id: 'prod_maped_color',
    name: 'Maped Color\'Peps Color Pencils — 24 Colors',
    slug: 'maped-colorpeps-color-pencils-24',
    categoryId: 'cat_stationery',
    subcategoryId: 'sub_color_pencils',
    description: 'Smooth, vibrant pigments. Triangular anti-roll barrel, perfect for young artists and school projects.',
    images: [img('Maped 24 Color', 'fff0e0', '333')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-09',
    variants: [
      { id: 'v_maped24', sku: '1T99-STN-002-24C', attributes: { pack: '24 Colors' }, price: 380, cost: 230, stock: 45, active: true },
    ],
  },
  {
    id: 'prod_casio_fx991',
    name: 'Casio FX-991EX Scientific Calculator',
    slug: 'casio-fx-991ex-scientific-calculator',
    categoryId: 'cat_stationery',
    subcategoryId: 'sub_calculators',
    description: '552 functions, natural textbook display, spreadsheet and equation solver. Essential for HSC and university students.',
    images: [img('Casio FX-991EX', 'e0f0e8', '333')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-11',
    variants: [
      { id: 'v_fx991', sku: '1T99-STN-003-991', attributes: {}, price: 1550, cost: 950, stock: 22, active: true },
    ],
  },
  {
    id: 'prod_citizen_ct580',
    name: 'Citizen CT-580 Basic Calculator',
    slug: 'citizen-ct-580-basic-calculator',
    categoryId: 'cat_stationery',
    subcategoryId: 'sub_calculators',
    description: '12-digit display, dual power (solar + battery), tax and memory functions. Ideal for shop counters.',
    images: [img('Citizen CT-580', 'f5f5e0', '333')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-14',
    variants: [
      { id: 'v_ct580', sku: '1T99-STN-004-CT580', attributes: {}, price: 450, cost: 280, stock: 35, active: true },
    ],
  },
  {
    id: 'prod_composition_notebook',
    name: 'Composition Notebook 200-page',
    slug: 'composition-notebook-200-page',
    categoryId: 'cat_stationery',
    subcategoryId: 'sub_notebooks',
    description: 'A4 ruled composition notebook, 80 GSM bright white paper, hard cover. Perfect for school and office.',
    images: [img('Notebook', 'f8f0e8', '333')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-16',
    variants: [
      { id: 'v_nb_red', sku: '1T99-STN-005-RED', attributes: { cover_color: 'Red' }, price: 120, cost: 70, stock: 80, active: true },
      { id: 'v_nb_blue', sku: '1T99-STN-005-BLU', attributes: { cover_color: 'Blue' }, price: 120, cost: 70, stock: 75, active: true },
      { id: 'v_nb_grn', sku: '1T99-STN-005-GRN', attributes: { cover_color: 'Green' }, price: 120, cost: 70, stock: 65, active: true },
    ],
  },

  // ── KITCHEN ───────────────────────────────────────────
  {
    id: 'prod_skylark_knife6',
    name: 'Skylark Stainless Knife 6-inch',
    slug: 'skylark-stainless-knife-6-inch',
    categoryId: 'cat_kitchen',
    subcategoryId: 'sub_knives',
    description: 'High-carbon stainless steel blade, 6-inch chef knife. Full-tang construction with ergonomic handle. Dishwasher safe.',
    images: [img('Skylark Knife 6"', 'e8e8e8', '333')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-07',
    variants: [
      { id: 'v_knife6', sku: '1T99-KCH-001-6IN', attributes: { size: '6-inch' }, price: 320, cost: 190, stock: 40, active: true },
    ],
  },
  {
    id: 'prod_skylark_knife8',
    name: 'Skylark Stainless Knife 8-inch',
    slug: 'skylark-stainless-knife-8-inch',
    categoryId: 'cat_kitchen',
    subcategoryId: 'sub_knives',
    description: 'Heavy-duty 8-inch chef knife for professional or home use. Same Skylark high-carbon blade as the 6-inch.',
    images: [img('Skylark Knife 8"', 'd8d8d8', '333')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-07',
    variants: [
      { id: 'v_knife8', sku: '1T99-KCH-001-8IN', attributes: { size: '8-inch' }, price: 420, cost: 250, stock: 28, active: true },
    ],
  },
  {
    id: 'prod_spoon_set',
    name: 'Stainless Steel Spoon Set — 6pcs',
    slug: 'stainless-steel-spoon-set-6pcs',
    categoryId: 'cat_kitchen',
    subcategoryId: 'sub_spoons',
    description: 'Premium 18/10 stainless steel serving spoons. Set of 6 — includes ladle, slotted spoon, rice scoop, and serving fork. Dishwasher safe.',
    images: [img('Spoon Set 6pcs', 'e5e5e5', '444')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-18',
    variants: [
      { id: 'v_spoon6', sku: '1T99-KCH-002-SP6', attributes: {}, price: 480, cost: 290, stock: 32, active: true },
    ],
  },
  {
    id: 'prod_miyako_kettle',
    name: 'Miyako Electric Kettle 1.8L',
    slug: 'miyako-electric-kettle-1-8l',
    categoryId: 'cat_kitchen',
    subcategoryId: 'sub_kettles',
    description: '1500W rapid boil, stainless steel interior, auto shut-off. Boils 1.8L in under 4 minutes. BSTI certified.',
    images: [img('Miyako Kettle', 'f0f5f0', '333')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-20',
    variants: [
      { id: 'v_kettle_wht', sku: '1T99-KCH-003-WHT', attributes: { color: 'White' }, price: 850, cost: 530, stock: 15, active: true },
      { id: 'v_kettle_blk', sku: '1T99-KCH-003-BLK', attributes: { color: 'Black' }, price: 850, cost: 530, stock: 11, active: true },
    ],
  },
  {
    id: 'prod_cake_mixer',
    name: 'Panasonic MK-GH1 Hand Mixer',
    slug: 'panasonic-mk-gh1-hand-mixer',
    categoryId: 'cat_kitchen',
    subcategoryId: 'sub_mixers',
    description: '200W hand mixer with 5-speed settings and turbo boost. Includes beaters and dough hooks. Lightweight at 800g.',
    images: [img('Panasonic Mixer', 'f5f0ff', '333')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-02-01',
    variants: [
      { id: 'v_mixer', sku: '1T99-KCH-004-MXR', attributes: {}, price: 1650, cost: 1050, stock: 9, active: true },
    ],
  },

  // ── CERAMICS & GLASS ──────────────────────────────────
  {
    id: 'prod_ceramic_plates',
    name: 'Ceramic Dinner Plate Set — 6pcs',
    slug: 'ceramic-dinner-plate-set-6pcs',
    categoryId: 'cat_ceramics',
    subcategoryId: 'sub_plates',
    description: 'Premium glazed ceramic dinner plates, 10.5-inch diameter. Microwave and dishwasher safe. Set of 6.',
    images: [img('Ceramic Plates', 'f8f8f0', '444')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-02-05',
    variants: [
      { id: 'v_plates_wht', sku: '1T99-CRM-001-WHT', attributes: { color: 'White' }, price: 1200, cost: 750, stock: 14, active: true },
      { id: 'v_plates_blu', sku: '1T99-CRM-001-BLU', attributes: { color: 'Blue Floral' }, price: 1350, cost: 850, stock: 8, active: true },
    ],
  },
  {
    id: 'prod_glass_vase',
    name: 'Crystal Glass Flower Vase — 30cm',
    slug: 'crystal-glass-flower-vase-30cm',
    categoryId: 'cat_ceramics',
    subcategoryId: 'sub_showpieces',
    description: 'Hand-blown crystal glass vase, 30cm tall. Prismatic cut design that refracts light beautifully. Perfect gift.',
    images: [img('Glass Vase', 'e8f5f8', '446')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-02-08',
    variants: [
      { id: 'v_vase', sku: '1T99-CRM-002-VAS', attributes: {}, price: 750, cost: 450, stock: 12, active: true },
    ],
  },
  {
    id: 'prod_tea_cup_set',
    name: 'Ceramic Tea Cup Set — 4pcs with Saucers',
    slug: 'ceramic-tea-cup-set-4pcs-saucers',
    categoryId: 'cat_ceramics',
    subcategoryId: 'sub_cups',
    description: 'Bone china tea cups with matching saucers. 200ml capacity. Beautiful floral print. Gift-box packaging.',
    images: [img('Tea Cup Set', 'fef0e8', '554')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-02-10',
    variants: [
      { id: 'v_cups_pink', sku: '1T99-CRM-003-PNK', attributes: { design: 'Pink Floral' }, price: 890, cost: 540, stock: 16, active: true },
      { id: 'v_cups_blue', sku: '1T99-CRM-003-BLU', attributes: { design: 'Blue Willow' }, price: 890, cost: 540, stock: 10, active: true },
    ],
  },

  // ── TOYS ─────────────────────────────────────────────
  {
    id: 'prod_barbie_doll',
    name: 'Barbie Classic Fashion Doll',
    slug: 'barbie-classic-fashion-doll',
    categoryId: 'cat_toys',
    subcategoryId: 'sub_dolls',
    description: 'Authentic Mattel Barbie with three fashion outfit sets. Poseable arms and legs. Ages 3+.',
    images: [img('Barbie Doll', 'ffe8f5', '554')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-25',
    variants: [
      { id: 'v_barbie_pink', sku: '1T99-TOY-001-PNK', attributes: { edition: 'Pink Dream' }, price: 1250, cost: 780, stock: 20, active: true },
      { id: 'v_barbie_blue', sku: '1T99-TOY-001-BLU', attributes: { edition: 'Beach Fun' }, price: 1250, cost: 780, stock: 14, active: true },
    ],
  },
  {
    id: 'prod_lego_classic',
    name: 'LEGO Classic Brick Box — 484pcs',
    slug: 'lego-classic-brick-box-484pcs',
    categoryId: 'cat_toys',
    subcategoryId: 'sub_edu_art',
    description: '484-piece LEGO classic set with wheels and windows for open-ended building. Ages 4+. Includes building ideas booklet.',
    images: [img('LEGO 484pcs', 'fff8e0', '553')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-01-28',
    variants: [
      { id: 'v_lego484', sku: '1T99-TOY-002-484', attributes: {}, price: 3500, cost: 2200, stock: 11, active: true },
    ],
  },
  {
    id: 'prod_abacus',
    name: 'Educational Abacus — 10-row Counting Frame',
    slug: 'educational-abacus-10-row',
    categoryId: 'cat_toys',
    subcategoryId: 'sub_edu_art',
    description: 'Solid wood frame with colourful beads. 10 rows of 10. For maths learning ages 3–8.',
    images: [img('Abacus', 'f0ffe8', '354')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-02-02',
    variants: [
      { id: 'v_abacus_nat', sku: '1T99-TOY-003-NAT', attributes: { frame: 'Natural Wood' }, price: 350, cost: 210, stock: 30, active: true },
      { id: 'v_abacus_col', sku: '1T99-TOY-003-COL', attributes: { frame: 'Coloured' }, price: 380, cost: 225, stock: 22, active: true },
    ],
  },
  {
    id: 'prod_rc_car',
    name: 'Remote Control Racing Car 1:24 Scale',
    slug: 'remote-control-racing-car-1-24',
    categoryId: 'cat_toys',
    subcategoryId: 'sub_rc_cars',
    description: '2.4GHz RC car, 30km/h top speed, rechargeable lithium battery (60-min run time). For ages 6+.',
    images: [img('RC Car', 'ffe8e0', '553')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-02-06',
    variants: [
      { id: 'v_rc_red', sku: '1T99-TOY-004-RED', attributes: { color: 'Red' }, price: 1800, cost: 1100, stock: 9, active: true },
      { id: 'v_rc_blu', sku: '1T99-TOY-004-BLU', attributes: { color: 'Blue' }, price: 1800, cost: 1100, stock: 7, active: true },
    ],
  },

  // ── BAGS & BELTS ──────────────────────────────────────
  {
    id: 'prod_leather_handbag',
    name: 'Leather Handbag — Classic Tote',
    slug: 'leather-handbag-classic-tote',
    categoryId: 'cat_bags',
    subcategoryId: 'sub_handbags',
    description: 'Genuine PU leather tote with interior zip pocket and two open pockets. Fits A4 documents. Shoulder strap included.',
    images: [img('Leather Handbag', 'f0e8e0', '443')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-02-12',
    variants: [
      { id: 'v_bag_blk', sku: '1T99-BAG-001-BLK', attributes: { color: 'black' }, price: 1650, cost: 1000, stock: 12, active: true },
      { id: 'v_bag_brn', sku: '1T99-BAG-001-BRN', attributes: { color: 'brown' }, price: 1650, cost: 1000, stock: 8, active: true },
      { id: 'v_bag_tan', sku: '1T99-BAG-001-TAN', attributes: { color: 'tan' }, price: 1750, cost: 1050, stock: 6, active: true },
    ],
  },
  {
    id: 'prod_canvas_backpack',
    name: 'Canvas Casual Backpack — 25L',
    slug: 'canvas-casual-backpack-25l',
    categoryId: 'cat_bags',
    subcategoryId: 'sub_backpacks',
    description: '25-litre canvas backpack with padded laptop sleeve (fits 15.6"), USB charging port, and adjustable straps.',
    images: [img('Canvas Backpack', 'e0e8f0', '334')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-02-14',
    variants: [
      { id: 'v_bp_blk', sku: '1T99-BAG-002-BLK', attributes: { color: 'black' }, price: 1450, cost: 880, stock: 18, active: true },
      { id: 'v_bp_blu', sku: '1T99-BAG-002-BLU', attributes: { color: 'blue' }, price: 1450, cost: 880, stock: 15, active: true },
      { id: 'v_bp_olv', sku: '1T99-BAG-002-OLV', attributes: { color: 'olive' }, price: 1450, cost: 880, stock: 10, active: true },
    ],
  },

  // ── BATHROOM ─────────────────────────────────────────
  {
    id: 'prod_towel_set',
    name: 'Premium Cotton Towel Set — 4pcs',
    slug: 'premium-cotton-towel-set-4pcs',
    categoryId: 'cat_bathroom',
    subcategoryId: 'sub_towels',
    description: '100% ring-spun cotton, 600 GSM. Set includes 2 bath towels and 2 hand towels. Extra-soft, quick-dry.',
    images: [img('Towel Set', 'f0f0f8', '446')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-02-20',
    variants: [
      { id: 'v_twl_wht', sku: '1T99-BTH-001-WHT', attributes: { color: 'White' }, price: 780, cost: 470, stock: 25, active: true },
      { id: 'v_twl_blu', sku: '1T99-BTH-001-BLU', attributes: { color: 'Blue' }, price: 780, cost: 470, stock: 18, active: true },
      { id: 'v_twl_grn', sku: '1T99-BTH-001-GRN', attributes: { color: 'Green' }, price: 780, cost: 470, stock: 14, active: true },
    ],
  },
  {
    id: 'prod_bath_mat',
    name: 'Non-Slip Bath Mat — Memory Foam',
    slug: 'non-slip-bath-mat-memory-foam',
    categoryId: 'cat_bathroom',
    subcategoryId: 'sub_bath_mats',
    description: 'Memory foam core with suction-cup base. Machine washable. 60×40cm.',
    images: [img('Bath Mat', 'f5f0ff', '446')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-02-22',
    variants: [
      { id: 'v_mat_grey', sku: '1T99-BTH-002-GRY', attributes: { color: 'Grey' }, price: 480, cost: 280, stock: 20, active: true },
      { id: 'v_mat_wht', sku: '1T99-BTH-002-WHT', attributes: { color: 'White' }, price: 480, cost: 280, stock: 16, active: true },
    ],
  },

  // ── SHOES ─────────────────────────────────────────────
  {
    id: 'prod_apex_loafer',
    name: 'Apex Men\'s Formal Loafer',
    slug: 'apex-mens-formal-loafer',
    categoryId: 'cat_shoes',
    subcategoryId: 'sub_mens_shoes',
    description: 'Genuine PU leather upper with cushioned insole. Slip-on design. Office and formal occasions.',
    images: [img('Apex Loafer', 'e8e0d8', '443')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-03-01',
    variants: [
      { id: 'v_apex_40', sku: '1T99-SHO-001-40', attributes: { size: '40', color: 'Black' }, price: 1850, cost: 1150, stock: 5, active: true },
      { id: 'v_apex_41', sku: '1T99-SHO-001-41', attributes: { size: '41', color: 'Black' }, price: 1850, cost: 1150, stock: 7, active: true },
      { id: 'v_apex_42', sku: '1T99-SHO-001-42', attributes: { size: '42', color: 'Black' }, price: 1850, cost: 1150, stock: 6, active: true },
      { id: 'v_apex_43', sku: '1T99-SHO-001-43', attributes: { size: '43', color: 'Black' }, price: 1850, cost: 1150, stock: 4, active: true },
    ],
  },
  {
    id: 'prod_shoe_brush',
    name: 'Shoe Care Brush Set — 3pcs',
    slug: 'shoe-care-brush-set-3pcs',
    categoryId: 'cat_shoes',
    subcategoryId: 'sub_shoe_care',
    description: 'Horsehair polishing brush, crepe suede cleaner brush, and synthetic all-purpose brush. Wooden handles.',
    images: [img('Shoe Brush Set', 'ede8e0', '443')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-03-05',
    variants: [
      { id: 'v_brush_set', sku: '1T99-SHO-002-BST', attributes: {}, price: 280, cost: 165, stock: 38, active: true },
    ],
  },

  // ── BIRTHDAY ──────────────────────────────────────────
  {
    id: 'prod_birthday_candles',
    name: 'Birthday Cake Candles — 24pcs',
    slug: 'birthday-cake-candles-24pcs',
    categoryId: 'cat_birthday',
    subcategoryId: 'sub_candles',
    description: 'Multi-coloured birthday candles. 24 per pack. Drip-free wax, 45-minute burn time each.',
    images: [img('Birthday Candles', 'fff0e0', '553')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-03-10',
    variants: [
      { id: 'v_candles', sku: '1T99-BDY-001-24', attributes: {}, price: 95, cost: 55, stock: 100, active: true },
    ],
  },
  {
    id: 'prod_party_balloons',
    name: 'Party Balloon Pack — 50pcs Assorted',
    slug: 'party-balloon-pack-50pcs',
    categoryId: 'cat_birthday',
    subcategoryId: 'sub_balloons',
    description: '50 latex balloons in assorted colours. Strong natural rubber, 12-inch diameter when inflated.',
    images: [img('Party Balloons', 'ffe8f5', '553')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-03-12',
    variants: [
      { id: 'v_balloons', sku: '1T99-BDY-002-50', attributes: {}, price: 180, cost: 105, stock: 75, active: true },
    ],
  },

  // ── FOOD COLORS ───────────────────────────────────────
  {
    id: 'prod_food_color_set',
    name: 'Liquid Food Color Set — 12 Colors',
    slug: 'liquid-food-color-set-12-colors',
    categoryId: 'cat_food_colors',
    subcategoryId: 'sub_liquid_colors',
    description: 'Food-grade liquid dyes, 12 vivid colours including red, blue, green, yellow, violet, orange. 20ml each. BSTI approved.',
    images: [img('Food Colors 12pc', 'f5f0ff', '553')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-03-15',
    variants: [
      { id: 'v_fc12', sku: '1T99-FDC-001-12', attributes: {}, price: 350, cost: 210, stock: 55, active: true },
    ],
  },

  // ── ELECTRIC ─────────────────────────────────────────
  {
    id: 'prod_extension_cord',
    name: 'Extension Cord 4-Socket 3M — Surge Protected',
    slug: 'extension-cord-4-socket-3m-surge',
    categoryId: 'cat_electric',
    subcategoryId: 'sub_extension',
    description: '4-socket extension cord with 3-metre flat copper wire, individual surge protectors, and child-safe shutters. 13A rating.',
    images: [img('Extension Cord', 'f0f5f8', '335')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-03-18',
    variants: [
      { id: 'v_ext_wht', sku: '1T99-ELC-001-WHT', attributes: { color: 'White' }, price: 420, cost: 255, stock: 45, active: true },
      { id: 'v_ext_blk', sku: '1T99-ELC-001-BLK', attributes: { color: 'Black' }, price: 420, cost: 255, stock: 30, active: true },
    ],
  },
  {
    id: 'prod_table_fan',
    name: 'Table Fan 12-inch — Oscillating',
    slug: 'table-fan-12-inch-oscillating',
    categoryId: 'cat_electric',
    subcategoryId: 'sub_fans',
    description: '3-speed oscillating table fan, 12-inch blade. Quiet motor, 45W. 90° oscillation, tilt-adjustable head.',
    images: [img('Table Fan', 'e8f5f0', '354')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-03-20',
    variants: [
      { id: 'v_fan_wht', sku: '1T99-ELC-002-WHT', attributes: { color: 'White' }, price: 1250, cost: 780, stock: 18, active: true },
    ],
  },
  {
    id: 'prod_led_bulbs',
    name: 'LED Bulb 9W Daylight — Pack of 4',
    slug: 'led-bulb-9w-daylight-pack-4',
    categoryId: 'cat_electric',
    subcategoryId: 'sub_bulbs',
    description: '9W LED, 900 lumen, 6500K daylight white. E27 base. 15,000-hour lifespan. Energy Star equivalent.',
    images: [img('LED Bulbs 4pk', 'fffff0', '553')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-03-22',
    variants: [
      { id: 'v_led_day', sku: '1T99-ELC-003-DAY', attributes: { tone: 'Daylight 6500K' }, price: 380, cost: 230, stock: 60, active: true },
      { id: 'v_led_wrm', sku: '1T99-ELC-003-WRM', attributes: { tone: 'Warm White 3000K' }, price: 380, cost: 230, stock: 48, active: true },
    ],
  },

  // ── WEDDING ───────────────────────────────────────────
  {
    id: 'prod_wedding_gift_wrap',
    name: 'Wedding Gift Wrap Bundle',
    slug: 'wedding-gift-wrap-bundle',
    categoryId: 'cat_wedding',
    subcategoryId: 'sub_wedding_wrap',
    description: 'Premium satin ribbon (10m), 6 sheets of pearl gift wrap paper, 2 gift bags, and a greeting card set. Perfect for wedding presents.',
    images: [img('Wedding Wrap', 'fff0f5', '553')],
    status: 'active',
    shopId: 'shop_mirpur',
    createdAt: '2026-03-25',
    variants: [
      { id: 'v_wgw_gld', sku: '1T99-WED-001-GLD', attributes: { color: 'Gold' }, price: 320, cost: 190, stock: 35, active: true },
      { id: 'v_wgw_sil', sku: '1T99-WED-001-SIL', attributes: { color: 'Silver' }, price: 320, cost: 190, stock: 28, active: true },
    ],
  },
]

export const getProductById = (id: string) => MARKET_PRODUCTS.find(p => p.id === id)
export const getProductBySlug = (slug: string) => MARKET_PRODUCTS.find(p => p.slug === slug)
export const getProductsByCategory = (catId: string) => MARKET_PRODUCTS.filter(p => p.categoryId === catId)
export const getMinPrice = (p: MarketProduct) => Math.min(...p.variants.map(v => v.price))
export const getMaxPrice = (p: MarketProduct) => Math.max(...p.variants.map(v => v.price))
export const getTotalStock = (p: MarketProduct) => p.variants.reduce((s, v) => s + v.stock, 0)
