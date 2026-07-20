export interface MarketShop {
  id: string
  name: string
  slug: string
  short_code: string
  city: string
  address: string
  phone: string
  email: string
  status: 'active' | 'pending' | 'inactive'
  admin_name: string
  established: string
  cover_url?: string
  tagline: string
}

export const MARKET_SHOPS: MarketShop[] = [
  {
    id: 'shop_mirpur',
    name: '1to99 Market — Mirpur (Dhaka)',
    slug: '1to99-market-dhaka-mirpur-tw3k9p',
    short_code: '1T99-DHK-MRP-001',
    city: 'Dhaka',
    address: 'Shop #12, Mirpur-10, Dhaka 1216',
    phone: '+880 1711-234567',
    email: 'mirpur@1to99market.com',
    status: 'active',
    admin_name: 'Shariful Islam',
    established: '2023-06-01',
    tagline: 'Everything you need, ৳1 to ৳9999',
  },
  {
    id: 'shop_agrabad',
    name: '1to99 Market — Agrabad (Chittagong)',
    slug: '1to99-market-ctg-agrabad-px7m2q',
    short_code: '1T99-CTG-AGR-002',
    city: 'Chittagong',
    address: 'Shop #5, Agrabad C/A, Chittagong 4100',
    phone: '+880 1811-345678',
    email: 'agrabad@1to99market.com',
    status: 'active',
    admin_name: 'Nasrin Akter',
    established: '2024-01-15',
    tagline: 'Chittagong\'s favourite everyday market',
  },
  {
    id: 'shop_sylhet',
    name: '1to99 Market — Sylhet',
    slug: '1to99-market-sylhet-yz4n8r',
    short_code: '1T99-SYL-001-003',
    city: 'Sylhet',
    address: 'Shop #8, Zindabazar, Sylhet 3100',
    phone: '+880 1911-456789',
    email: 'sylhet@1to99market.com',
    status: 'active',
    admin_name: 'Karim Uddin',
    established: '2024-08-20',
    tagline: 'Sylhet\'s best value market',
  },
]

export const DEMO_SHOP = MARKET_SHOPS[0]

/** Canonical storefront slug for the primary 1to99 Mirpur demo shop (admin-store shop_6). */
export const DEFAULT_1TO99_STOREFRONT_SLUG = DEMO_SHOP.slug
