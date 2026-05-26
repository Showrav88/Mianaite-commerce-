export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type OrderSource = 'online' | 'counter'

export interface OrderItem {
  productId: string
  productName: string
  variantId: string
  variantSku: string
  variantLabel: string
  qty: number
  unitPrice: number
  subtotal: number
}

export interface MarketOrder {
  id: string
  orderNumber: string
  shopId: string
  source: OrderSource
  status: OrderStatus
  customerName: string
  customerPhone: string
  customerAddress?: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'card' | 'bkash' | 'nagad' | 'split'
  note?: string
  createdAt: string
  updatedAt: string
  cashier?: string
}

export const MARKET_ORDERS: MarketOrder[] = [
  {
    id: 'ord_001',
    orderNumber: '1T99-240501-0001',
    shopId: 'shop_mirpur',
    source: 'online',
    status: 'delivered',
    customerName: 'Rahim Uddin',
    customerPhone: '01711-111111',
    customerAddress: 'Flat 3B, Road 5, Mirpur-10, Dhaka',
    items: [
      { productId: 'prod_casio_mq24', productName: 'Casio MQ-24 Classic Watch', variantId: 'v_mq24_blk', variantSku: '1T99-WCH-001-BLK', variantLabel: 'Black / Resin', qty: 1, unitPrice: 950, subtotal: 950 },
      { productId: 'prod_pilot_v5', productName: 'Pilot V5 Hi-Tecpoint Pen', variantId: 'v_v5_blu', variantSku: '1T99-STN-001-BLU', variantLabel: 'Blue', qty: 3, unitPrice: 110, subtotal: 330 },
    ],
    subtotal: 1280, discount: 0, total: 1280,
    paymentMethod: 'bkash',
    createdAt: '2026-05-01', updatedAt: '2026-05-03',
  },
  {
    id: 'ord_002',
    orderNumber: '1T99-240502-0002',
    shopId: 'shop_mirpur',
    source: 'counter',
    status: 'delivered',
    customerName: 'Walk-in Customer',
    customerPhone: '—',
    items: [
      { productId: 'prod_skylark_knife6', productName: 'Skylark Stainless Knife 6-inch', variantId: 'v_knife6', variantSku: '1T99-KCH-001-6IN', variantLabel: '6-inch', qty: 1, unitPrice: 320, subtotal: 320 },
      { productId: 'prod_spoon_set', productName: 'Stainless Steel Spoon Set — 6pcs', variantId: 'v_spoon6', variantSku: '1T99-KCH-002-SP6', variantLabel: 'Standard', qty: 1, unitPrice: 480, subtotal: 480 },
    ],
    subtotal: 800, discount: 50, total: 750,
    paymentMethod: 'cash',
    cashier: 'Shariful Islam',
    createdAt: '2026-05-02', updatedAt: '2026-05-02',
  },
  {
    id: 'ord_003',
    orderNumber: '1T99-240503-0003',
    shopId: 'shop_mirpur',
    source: 'online',
    status: 'processing',
    customerName: 'Fatema Begum',
    customerPhone: '01811-222222',
    customerAddress: 'House 12, Lane 3, Dhanmondi, Dhaka',
    items: [
      { productId: 'prod_ceramic_plates', productName: 'Ceramic Dinner Plate Set — 6pcs', variantId: 'v_plates_wht', variantSku: '1T99-CRM-001-WHT', variantLabel: 'White', qty: 1, unitPrice: 1200, subtotal: 1200 },
      { productId: 'prod_tea_cup_set', productName: 'Ceramic Tea Cup Set — 4pcs', variantId: 'v_cups_pink', variantSku: '1T99-CRM-003-PNK', variantLabel: 'Pink Floral', qty: 1, unitPrice: 890, subtotal: 890 },
    ],
    subtotal: 2090, discount: 0, total: 2090,
    paymentMethod: 'nagad',
    createdAt: '2026-05-03', updatedAt: '2026-05-04',
  },
  {
    id: 'ord_004',
    orderNumber: '1T99-240505-0004',
    shopId: 'shop_mirpur',
    source: 'counter',
    status: 'delivered',
    customerName: 'Kamal Hossain',
    customerPhone: '01911-333333',
    items: [
      { productId: 'prod_casio_fx991', productName: 'Casio FX-991EX Scientific Calculator', variantId: 'v_fx991', variantSku: '1T99-STN-003-991', variantLabel: 'Standard', qty: 1, unitPrice: 1550, subtotal: 1550 },
    ],
    subtotal: 1550, discount: 0, total: 1550,
    paymentMethod: 'card',
    cashier: 'Shariful Islam',
    createdAt: '2026-05-05', updatedAt: '2026-05-05',
  },
  {
    id: 'ord_005',
    orderNumber: '1T99-240507-0005',
    shopId: 'shop_mirpur',
    source: 'online',
    status: 'shipped',
    customerName: 'Nasrin Khatun',
    customerPhone: '01611-444444',
    customerAddress: 'Apt 5A, Uttara Sector 6, Dhaka',
    items: [
      { productId: 'prod_leather_handbag', productName: 'Leather Handbag — Classic Tote', variantId: 'v_bag_blk', variantSku: '1T99-BAG-001-BLK', variantLabel: 'Black', qty: 1, unitPrice: 1650, subtotal: 1650 },
    ],
    subtotal: 1650, discount: 0, total: 1650,
    paymentMethod: 'bkash',
    createdAt: '2026-05-07', updatedAt: '2026-05-09',
  },
  {
    id: 'ord_006',
    orderNumber: '1T99-240508-0006',
    shopId: 'shop_mirpur',
    source: 'counter',
    status: 'delivered',
    customerName: 'Tariq Ahmad',
    customerPhone: '01511-555555',
    items: [
      { productId: 'prod_miyako_kettle', productName: 'Miyako Electric Kettle 1.8L', variantId: 'v_kettle_wht', variantSku: '1T99-KCH-003-WHT', variantLabel: 'White', qty: 1, unitPrice: 850, subtotal: 850 },
      { productId: 'prod_extension_cord', productName: 'Extension Cord 4-Socket 3M', variantId: 'v_ext_wht', variantSku: '1T99-ELC-001-WHT', variantLabel: 'White', qty: 1, unitPrice: 420, subtotal: 420 },
      { productId: 'prod_led_bulbs', productName: 'LED Bulb 9W Daylight Pack of 4', variantId: 'v_led_day', variantSku: '1T99-ELC-003-DAY', variantLabel: 'Daylight 6500K', qty: 2, unitPrice: 380, subtotal: 760 },
    ],
    subtotal: 2030, discount: 100, total: 1930,
    paymentMethod: 'split',
    cashier: 'Shariful Islam',
    createdAt: '2026-05-08', updatedAt: '2026-05-08',
  },
  {
    id: 'ord_007',
    orderNumber: '1T99-240510-0007',
    shopId: 'shop_mirpur',
    source: 'online',
    status: 'pending',
    customerName: 'Sumaiya Islam',
    customerPhone: '01311-666666',
    customerAddress: 'House 7, Road 12, Bashundhara R/A, Dhaka',
    items: [
      { productId: 'prod_barbie_doll', productName: 'Barbie Classic Fashion Doll', variantId: 'v_barbie_pink', variantSku: '1T99-TOY-001-PNK', variantLabel: 'Pink Dream', qty: 1, unitPrice: 1250, subtotal: 1250 },
      { productId: 'prod_birthday_candles', productName: 'Birthday Cake Candles — 24pcs', variantId: 'v_candles', variantSku: '1T99-BDY-001-24', variantLabel: 'Assorted', qty: 2, unitPrice: 95, subtotal: 190 },
      { productId: 'prod_party_balloons', productName: 'Party Balloon Pack — 50pcs', variantId: 'v_balloons', variantSku: '1T99-BDY-002-50', variantLabel: 'Assorted', qty: 1, unitPrice: 180, subtotal: 180 },
    ],
    subtotal: 1620, discount: 0, total: 1620,
    paymentMethod: 'bkash',
    createdAt: '2026-05-10', updatedAt: '2026-05-10',
  },
  {
    id: 'ord_008',
    orderNumber: '1T99-240511-0008',
    shopId: 'shop_mirpur',
    source: 'counter',
    status: 'delivered',
    customerName: 'Walk-in Customer',
    customerPhone: '—',
    items: [
      { productId: 'prod_lego_classic', productName: 'LEGO Classic Brick Box — 484pcs', variantId: 'v_lego484', variantSku: '1T99-TOY-002-484', variantLabel: 'Standard', qty: 1, unitPrice: 3500, subtotal: 3500 },
    ],
    subtotal: 3500, discount: 200, total: 3300,
    paymentMethod: 'cash',
    cashier: 'Shariful Islam',
    createdAt: '2026-05-11', updatedAt: '2026-05-11',
  },
  {
    id: 'ord_009',
    orderNumber: '1T99-240512-0009',
    shopId: 'shop_mirpur',
    source: 'online',
    status: 'confirmed',
    customerName: 'Rafiqul Islam',
    customerPhone: '01411-777777',
    customerAddress: 'Flat 2, House 15, Mohammadpur, Dhaka',
    items: [
      { productId: 'prod_canvas_backpack', productName: 'Canvas Casual Backpack — 25L', variantId: 'v_bp_blu', variantSku: '1T99-BAG-002-BLU', variantLabel: 'Blue', qty: 1, unitPrice: 1450, subtotal: 1450 },
      { productId: 'prod_composition_notebook', productName: 'Composition Notebook 200-page', variantId: 'v_nb_red', variantSku: '1T99-STN-005-RED', variantLabel: 'Red Cover', qty: 3, unitPrice: 120, subtotal: 360 },
    ],
    subtotal: 1810, discount: 0, total: 1810,
    paymentMethod: 'bkash',
    createdAt: '2026-05-12', updatedAt: '2026-05-12',
  },
  {
    id: 'ord_010',
    orderNumber: '1T99-240513-0010',
    shopId: 'shop_mirpur',
    source: 'counter',
    status: 'delivered',
    customerName: 'Mehedi Hasan',
    customerPhone: '01211-888888',
    items: [
      { productId: 'prod_apex_loafer', productName: "Apex Men's Formal Loafer", variantId: 'v_apex_42', variantSku: '1T99-SHO-001-42', variantLabel: 'Size 42 / Black', qty: 1, unitPrice: 1850, subtotal: 1850 },
      { productId: 'prod_shoe_brush', productName: 'Shoe Care Brush Set — 3pcs', variantId: 'v_brush_set', variantSku: '1T99-SHO-002-BST', variantLabel: 'Standard', qty: 1, unitPrice: 280, subtotal: 280 },
    ],
    subtotal: 2130, discount: 0, total: 2130,
    paymentMethod: 'nagad',
    cashier: 'Shariful Islam',
    createdAt: '2026-05-13', updatedAt: '2026-05-13',
  },
  {
    id: 'ord_011',
    orderNumber: '1T99-240514-0011',
    shopId: 'shop_mirpur',
    source: 'online',
    status: 'cancelled',
    customerName: 'Monira Begum',
    customerPhone: '01111-999999',
    customerAddress: 'House 22, Road 4, Gulshan-1, Dhaka',
    items: [
      { productId: 'prod_qq_analog', productName: 'Q&Q Analog Watch — Stainless Steel', variantId: 'v_qq_gld', variantSku: '1T99-WCH-003-GLD', variantLabel: 'Gold Dial / Steel', qty: 1, unitPrice: 2050, subtotal: 2050 },
    ],
    subtotal: 2050, discount: 0, total: 2050,
    paymentMethod: 'bkash',
    note: 'Customer requested cancellation — wrong size',
    createdAt: '2026-05-14', updatedAt: '2026-05-15',
  },
  {
    id: 'ord_012',
    orderNumber: '1T99-240515-0012',
    shopId: 'shop_mirpur',
    source: 'counter',
    status: 'delivered',
    customerName: 'Walk-in Customer',
    customerPhone: '—',
    items: [
      { productId: 'prod_towel_set', productName: 'Premium Cotton Towel Set — 4pcs', variantId: 'v_twl_blu', variantSku: '1T99-BTH-001-BLU', variantLabel: 'Blue', qty: 1, unitPrice: 780, subtotal: 780 },
      { productId: 'prod_bath_mat', productName: 'Non-Slip Bath Mat', variantId: 'v_mat_grey', variantSku: '1T99-BTH-002-GRY', variantLabel: 'Grey', qty: 1, unitPrice: 480, subtotal: 480 },
    ],
    subtotal: 1260, discount: 60, total: 1200,
    paymentMethod: 'cash',
    cashier: 'Shariful Islam',
    createdAt: '2026-05-15', updatedAt: '2026-05-15',
  },
  {
    id: 'ord_013',
    orderNumber: '1T99-240516-0013',
    shopId: 'shop_mirpur',
    source: 'online',
    status: 'processing',
    customerName: 'Shirin Akter',
    customerPhone: '01811-101010',
    customerAddress: 'Apt 8, House 33, Mirpur DOHS, Dhaka',
    items: [
      { productId: 'prod_maped_color', productName: "Maped Color'Peps Color Pencils — 24 Colors", variantId: 'v_maped24', variantSku: '1T99-STN-002-24C', variantLabel: '24 Colors', qty: 2, unitPrice: 380, subtotal: 760 },
      { productId: 'prod_abacus', productName: 'Educational Abacus — 10-row', variantId: 'v_abacus_col', variantSku: '1T99-TOY-003-COL', variantLabel: 'Coloured', qty: 1, unitPrice: 380, subtotal: 380 },
    ],
    subtotal: 1140, discount: 0, total: 1140,
    paymentMethod: 'nagad',
    createdAt: '2026-05-16', updatedAt: '2026-05-17',
  },
  {
    id: 'ord_014',
    orderNumber: '1T99-240517-0014',
    shopId: 'shop_mirpur',
    source: 'counter',
    status: 'delivered',
    customerName: 'Arif Hossain',
    customerPhone: '01711-121212',
    items: [
      { productId: 'prod_wedding_gift_wrap', productName: 'Wedding Gift Wrap Bundle', variantId: 'v_wgw_gld', variantSku: '1T99-WED-001-GLD', variantLabel: 'Gold', qty: 3, unitPrice: 320, subtotal: 960 },
    ],
    subtotal: 960, discount: 0, total: 960,
    paymentMethod: 'cash',
    cashier: 'Shariful Islam',
    createdAt: '2026-05-17', updatedAt: '2026-05-17',
  },
  {
    id: 'ord_015',
    orderNumber: '1T99-240518-0015',
    shopId: 'shop_mirpur',
    source: 'online',
    status: 'pending',
    customerName: 'Tahmina Khatun',
    customerPhone: '01611-131313',
    customerAddress: 'House 5, Road 8, Tejgaon, Dhaka',
    items: [
      { productId: 'prod_food_color_set', productName: 'Liquid Food Color Set — 12 Colors', variantId: 'v_fc12', variantSku: '1T99-FDC-001-12', variantLabel: '12 Colors', qty: 2, unitPrice: 350, subtotal: 700 },
      { productId: 'prod_birthday_candles', productName: 'Birthday Cake Candles — 24pcs', variantId: 'v_candles', variantSku: '1T99-BDY-001-24', variantLabel: 'Assorted', qty: 3, unitPrice: 95, subtotal: 285 },
    ],
    subtotal: 985, discount: 0, total: 985,
    paymentMethod: 'bkash',
    createdAt: '2026-05-18', updatedAt: '2026-05-18',
  },
  {
    id: 'ord_016',
    orderNumber: '1T99-240519-0016',
    shopId: 'shop_mirpur',
    source: 'counter',
    status: 'delivered',
    customerName: 'Walk-in Customer',
    customerPhone: '—',
    items: [
      { productId: 'prod_table_fan', productName: 'Table Fan 12-inch — Oscillating', variantId: 'v_fan_wht', variantSku: '1T99-ELC-002-WHT', variantLabel: 'White', qty: 1, unitPrice: 1250, subtotal: 1250 },
    ],
    subtotal: 1250, discount: 0, total: 1250,
    paymentMethod: 'cash',
    cashier: 'Shariful Islam',
    createdAt: '2026-05-19', updatedAt: '2026-05-19',
  },
  {
    id: 'ord_017',
    orderNumber: '1T99-240520-0017',
    shopId: 'shop_mirpur',
    source: 'online',
    status: 'confirmed',
    customerName: 'Kamruzzaman',
    customerPhone: '01411-141414',
    customerAddress: 'Flat B3, House 11, Banani, Dhaka',
    items: [
      { productId: 'prod_casio_f91w', productName: 'Casio F-91W Digital Watch', variantId: 'v_f91w_gld', variantSku: '1T99-WCH-002-GLD', variantLabel: 'Gold Dial / Steel', qty: 1, unitPrice: 1350, subtotal: 1350 },
    ],
    subtotal: 1350, discount: 0, total: 1350,
    paymentMethod: 'bkash',
    createdAt: '2026-05-20', updatedAt: '2026-05-20',
  },
  {
    id: 'ord_018',
    orderNumber: '1T99-240521-0018',
    shopId: 'shop_mirpur',
    source: 'counter',
    status: 'delivered',
    customerName: 'Walk-in Customer',
    customerPhone: '—',
    items: [
      { productId: 'prod_cake_mixer', productName: 'Panasonic MK-GH1 Hand Mixer', variantId: 'v_mixer', variantSku: '1T99-KCH-004-MXR', variantLabel: 'Standard', qty: 1, unitPrice: 1650, subtotal: 1650 },
    ],
    subtotal: 1650, discount: 100, total: 1550,
    paymentMethod: 'card',
    cashier: 'Shariful Islam',
    createdAt: '2026-05-21', updatedAt: '2026-05-21',
  },
  {
    id: 'ord_019',
    orderNumber: '1T99-240522-0019',
    shopId: 'shop_mirpur',
    source: 'online',
    status: 'pending',
    customerName: 'Roksana Parvin',
    customerPhone: '01311-151515',
    customerAddress: 'House 18, Lane 6, Khilgaon, Dhaka',
    items: [
      { productId: 'prod_glass_vase', productName: 'Crystal Glass Flower Vase — 30cm', variantId: 'v_vase', variantSku: '1T99-CRM-002-VAS', variantLabel: 'Crystal', qty: 2, unitPrice: 750, subtotal: 1500 },
    ],
    subtotal: 1500, discount: 0, total: 1500,
    paymentMethod: 'bkash',
    createdAt: '2026-05-22', updatedAt: '2026-05-22',
  },
  {
    id: 'ord_020',
    orderNumber: '1T99-240523-0020',
    shopId: 'shop_mirpur',
    source: 'counter',
    status: 'delivered',
    customerName: 'Walk-in Customer',
    customerPhone: '—',
    items: [
      { productId: 'prod_rc_car', productName: 'Remote Control Racing Car 1:24 Scale', variantId: 'v_rc_red', variantSku: '1T99-TOY-004-RED', variantLabel: 'Red', qty: 1, unitPrice: 1800, subtotal: 1800 },
      { productId: 'prod_party_balloons', productName: 'Party Balloon Pack — 50pcs', variantId: 'v_balloons', variantSku: '1T99-BDY-002-50', variantLabel: 'Assorted', qty: 2, unitPrice: 180, subtotal: 360 },
    ],
    subtotal: 2160, discount: 0, total: 2160,
    paymentMethod: 'cash',
    cashier: 'Shariful Islam',
    createdAt: '2026-05-23', updatedAt: '2026-05-23',
  },
]

export const getOrderById = (id: string) => MARKET_ORDERS.find(o => o.id === id)
export const getOrdersByShop = (shopId: string) => MARKET_ORDERS.filter(o => o.shopId === shopId)
