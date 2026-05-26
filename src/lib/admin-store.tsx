import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface ShopTheme {
  primaryColor: string
  accentColor: string
  borderRadius: 'sharp' | 'medium' | 'rounded'
  fontFamily: 'Inter' | 'Poppins' | 'Roboto'
}

export interface ShopActiveSale {
  name: string
  nameBn: string
  discountPercent: number
  productIds: string[]
  endsAt?: string
}

export interface Shop {
  id: string
  name: string
  slug: string
  description: string
  ownerId: string
  ownerName: string
  status: 'active' | 'inactive' | 'pending'
  allowedCategories: string[]
  theme: ShopTheme
  stats: { products: number; orders: number; revenue: number; customers: number }
  createdAt: string
  logo?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  motto?: string
  facebookPageUrl?: string
  facebookGroupUrl?: string
  activeSale?: ShopActiveSale
  activeCoverId?: string
  broadcast?: { text: string; active: boolean }
}

export interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string
  role: 'super_admin' | 'shop_admin'
  shopId?: string
  shopName?: string
  status: 'active' | 'inactive' | 'pending'
  permissions: string[]
  createdAt: string
  lastLogin?: string
}

export interface Category {
  id: string
  name: string
  nameBn: string
  icon: string
  slug: string
}

export interface Subcategory {
  id: string
  name: string
  nameBn: string
  categoryId: string
}

export const SUBCATEGORIES_BY_CATEGORY: Record<string, Subcategory[]> = {
  cat_electronics: [
    { id: 'sub_smartphone', name: 'Smartphone', nameBn: 'স্মার্টফোন', categoryId: 'cat_electronics' },
    { id: 'sub_laptop', name: 'Laptop', nameBn: 'ল্যাপটপ', categoryId: 'cat_electronics' },
    { id: 'sub_tv', name: 'TV & Monitor', nameBn: 'টিভি ও মনিটর', categoryId: 'cat_electronics' },
    { id: 'sub_audio', name: 'Audio', nameBn: 'অডিও', categoryId: 'cat_electronics' },
    { id: 'sub_camera', name: 'Camera', nameBn: 'ক্যামেরা', categoryId: 'cat_electronics' },
    { id: 'sub_gaming', name: 'Gaming', nameBn: 'গেমিং', categoryId: 'cat_electronics' },
    { id: 'sub_wifi', name: 'WiFi & Network', nameBn: 'ওয়াইফাই ও নেটওয়ার্ক', categoryId: 'cat_electronics' },
    { id: 'sub_pc_parts', name: 'PC Components (RAM/SSD)', nameBn: 'পিসি পার্টস (RAM, SSD)', categoryId: 'cat_electronics' },
    { id: 'sub_tablet', name: 'Tablet', nameBn: 'ট্যাবলেট', categoryId: 'cat_electronics' },
    { id: 'sub_smartwatch', name: 'Smart Watch', nameBn: 'স্মার্ট ওয়াচ', categoryId: 'cat_electronics' },
  ],
  cat_fashion: [
    { id: 'sub_mens_shirt', name: "Men's Shirt", nameBn: 'পুরুষের শার্ট', categoryId: 'cat_fashion' },
    { id: 'sub_mens_tshirt', name: "Men's T-Shirt", nameBn: 'পুরুষের টি-শার্ট', categoryId: 'cat_fashion' },
    { id: 'sub_mens_pants', name: "Men's Pants", nameBn: 'পুরুষের প্যান্ট', categoryId: 'cat_fashion' },
    { id: 'sub_mens_shorts', name: "Men's Shorts", nameBn: 'পুরুষের শর্টস', categoryId: 'cat_fashion' },
    { id: 'sub_mens_suit', name: "Men's Suit", nameBn: 'পুরুষের স্যুট', categoryId: 'cat_fashion' },
    { id: 'sub_mens_socks', name: "Men's Socks", nameBn: 'পুরুষের মোজা', categoryId: 'cat_fashion' },
    { id: 'sub_mens_innerwear', name: "Men's Innerwear", nameBn: 'পুরুষের আন্ডারওয়্যার', categoryId: 'cat_fashion' },
    { id: 'sub_saree', name: 'Saree', nameBn: 'শাড়ি', categoryId: 'cat_fashion' },
    { id: 'sub_salwar', name: 'Salwar Kameez', nameBn: 'সালোয়ার কামিজ', categoryId: 'cat_fashion' },
    { id: 'sub_dress', name: "Women's Dress", nameBn: 'মহিলাদের পোশাক', categoryId: 'cat_fashion' },
    { id: 'sub_hijab', name: 'Hijab & Scarf', nameBn: 'হিজাব ও স্কার্ফ', categoryId: 'cat_fashion' },
    { id: 'sub_shoes', name: 'Shoes & Sandals', nameBn: 'জুতা ও স্যান্ডেল', categoryId: 'cat_fashion' },
    { id: 'sub_bag', name: 'Bag & Purse', nameBn: 'ব্যাগ ও পার্স', categoryId: 'cat_fashion' },
  ],
  cat_groceries: [
    { id: 'sub_rice', name: 'Rice & Grains', nameBn: 'চাল ও শস্য', categoryId: 'cat_groceries' },
    { id: 'sub_vegetables', name: 'Vegetables', nameBn: 'সবজি', categoryId: 'cat_groceries' },
    { id: 'sub_fruits', name: 'Fruits', nameBn: 'ফল', categoryId: 'cat_groceries' },
    { id: 'sub_dairy', name: 'Dairy & Eggs', nameBn: 'দুগ্ধজাত ও ডিম', categoryId: 'cat_groceries' },
    { id: 'sub_spices', name: 'Oil & Spices', nameBn: 'তেল ও মসলা', categoryId: 'cat_groceries' },
    { id: 'sub_snacks', name: 'Snacks', nameBn: 'স্ন্যাকস', categoryId: 'cat_groceries' },
    { id: 'sub_fish', name: 'Fish & Meat', nameBn: 'মাছ ও মাংস', categoryId: 'cat_groceries' },
  ],
  cat_home: [
    { id: 'sub_kitchen', name: 'Kitchen & Cookware', nameBn: 'রান্নাঘর', categoryId: 'cat_home' },
    { id: 'sub_bedding', name: 'Bedding', nameBn: 'বিছানার চাদর', categoryId: 'cat_home' },
    { id: 'sub_furniture_h', name: 'Furniture', nameBn: 'আসবাবপত্র', categoryId: 'cat_home' },
    { id: 'sub_lighting', name: 'Lighting', nameBn: 'আলো', categoryId: 'cat_home' },
    { id: 'sub_cleaning', name: 'Cleaning', nameBn: 'পরিষ্কার', categoryId: 'cat_home' },
    { id: 'sub_decor', name: 'Home Decor', nameBn: 'হোম ডেকোর', categoryId: 'cat_home' },
  ],
  cat_beauty: [
    { id: 'sub_skincare', name: 'Skincare', nameBn: 'স্কিনকেয়ার', categoryId: 'cat_beauty' },
    { id: 'sub_haircare', name: 'Haircare', nameBn: 'চুলের যত্ন', categoryId: 'cat_beauty' },
    { id: 'sub_makeup', name: 'Makeup', nameBn: 'মেকআপ', categoryId: 'cat_beauty' },
    { id: 'sub_perfume', name: 'Perfume', nameBn: 'পারফিউম', categoryId: 'cat_beauty' },
  ],
  cat_kids: [
    { id: 'sub_toys', name: 'Toys & Games', nameBn: 'খেলনা', categoryId: 'cat_kids' },
    { id: 'sub_baby', name: 'Baby Care', nameBn: 'শিশু যত্ন', categoryId: 'cat_kids' },
    { id: 'sub_school', name: 'School Supplies', nameBn: 'স্কুলের জিনিস', categoryId: 'cat_kids' },
    { id: 'sub_kids_clothes', name: 'Kids Clothing', nameBn: 'শিশুর পোশাক', categoryId: 'cat_kids' },
  ],
  cat_sports: [
    { id: 'sub_fitness', name: 'Fitness Equipment', nameBn: 'ফিটনেস সরঞ্জাম', categoryId: 'cat_sports' },
    { id: 'sub_outdoor', name: 'Outdoor', nameBn: 'আউটডোর', categoryId: 'cat_sports' },
    { id: 'sub_team_sports', name: 'Team Sports', nameBn: 'দলগত খেলাধুলা', categoryId: 'cat_sports' },
    { id: 'sub_athletic', name: 'Athletic Wear', nameBn: 'অ্যাথলেটিক পোশাক', categoryId: 'cat_sports' },
  ],
  cat_books: [
    { id: 'sub_academic', name: 'Academic', nameBn: 'শিক্ষামূলক', categoryId: 'cat_books' },
    { id: 'sub_fiction', name: 'Fiction & Novel', nameBn: 'উপন্যাস', categoryId: 'cat_books' },
    { id: 'sub_religious', name: 'Religious', nameBn: 'ধর্মীয়', categoryId: 'cat_books' },
    { id: 'sub_comics', name: 'Comics', nameBn: 'কমিক্স', categoryId: 'cat_books' },
  ],
  cat_jewelry: [
    { id: 'sub_gold', name: 'Gold Jewelry', nameBn: 'সোনার গহনা', categoryId: 'cat_jewelry' },
    { id: 'sub_silver', name: 'Silver Jewelry', nameBn: 'রূপার গহনা', categoryId: 'cat_jewelry' },
    { id: 'sub_artificial', name: 'Artificial Jewelry', nameBn: 'কৃত্রিম গহনা', categoryId: 'cat_jewelry' },
    { id: 'sub_accessories_j', name: 'Accessories', nameBn: 'এক্সেসরিজ', categoryId: 'cat_jewelry' },
  ],
  cat_furniture: [
    { id: 'sub_sofa', name: 'Sofa & Chair', nameBn: 'সোফা ও চেয়ার', categoryId: 'cat_furniture' },
    { id: 'sub_bed', name: 'Bed & Mattress', nameBn: 'বিছানা', categoryId: 'cat_furniture' },
    { id: 'sub_table', name: 'Table & Desk', nameBn: 'টেবিল', categoryId: 'cat_furniture' },
    { id: 'sub_cabinet', name: 'Cabinet & Storage', nameBn: 'আলমারি', categoryId: 'cat_furniture' },
  ],
}

export interface AdminProduct {
  id: string
  name: string
  sku: string
  categoryId: string
  subcategoryId?: string
  shopId: string
  price: number
  stock: number
  lowStockThreshold: number
  status: 'active' | 'draft' | 'inactive'
  image: string
  images?: string[]
  description: string
  sold: number
  /** Legacy single field; still read for older saved products */
  videoUrl?: string
  youtubeUrl?: string
  facebookVideoUrl?: string
  tags?: string[]
  costPrice?: number
  discountType?: 'percent' | 'amount'
  discountValue?: number
}

export interface Order {
  id: string
  orderNumber: string
  shopId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: { name: string; qty: number; price: number }[]
  subtotal: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: 'cod'
  createdAt: string
}

export const ALL_CATEGORIES: Category[] = [
  { id: 'cat_electronics', name: 'Electronics', nameBn: 'ইলেকট্রনিক্স', icon: '💻', slug: 'electronics' },
  { id: 'cat_fashion', name: 'Fashion', nameBn: 'ফ্যাশন', icon: '👗', slug: 'fashion' },
  { id: 'cat_groceries', name: 'Groceries', nameBn: 'গ্রোসারি', icon: '🛒', slug: 'groceries' },
  { id: 'cat_home', name: 'Home & Living', nameBn: 'হোম ও লিভিং', icon: '🏠', slug: 'home' },
  { id: 'cat_beauty', name: 'Beauty', nameBn: 'বিউটি', icon: '💄', slug: 'beauty' },
  { id: 'cat_kids', name: 'Kids', nameBn: 'শিশু', icon: '🧸', slug: 'kids' },
  { id: 'cat_sports', name: 'Sports', nameBn: 'স্পোর্টস', icon: '⚽', slug: 'sports' },
  { id: 'cat_books', name: 'Books', nameBn: 'বই', icon: '📚', slug: 'books' },
  { id: 'cat_jewelry', name: 'Jewelry', nameBn: 'জুয়েলারি', icon: '💎', slug: 'jewelry' },
  { id: 'cat_furniture', name: 'Furniture', nameBn: 'আসবাবপত্র', icon: '🛋️', slug: 'furniture' },
]

export const ALL_PERMISSIONS = [
  { key: 'manage_products', label: 'Manage Products', labelBn: 'পণ্য পরিচালনা' },
  { key: 'manage_orders', label: 'Manage Orders', labelBn: 'অর্ডার পরিচালনা' },
  { key: 'manage_inventory', label: 'Manage Inventory', labelBn: 'ইনভেন্টরি পরিচালনা' },
  { key: 'view_analytics', label: 'View Analytics', labelBn: 'বিশ্লেষণ দেখুন' },
  { key: 'manage_settings', label: 'Manage Settings', labelBn: 'সেটিংস পরিচালনা' },
  { key: 'manage_customers', label: 'Manage Customers', labelBn: 'গ্রাহক পরিচালনা' },
]

const INITIAL_SHOPS: Shop[] = [
  {
    id: 'shop_1', name: 'TechHub BD', slug: 'techhub-bd',
    description: 'Your one-stop shop for all electronics and gadgets in Bangladesh',
    ownerId: 'adm_1', ownerName: 'Rahim Tech', status: 'active',
    allowedCategories: ['cat_electronics', 'cat_home'],
    theme: { primaryColor: '#6366f1', accentColor: '#8b5cf6', borderRadius: 'medium', fontFamily: 'Inter' },
    stats: { products: 48, orders: 312, revenue: 4850000, customers: 287 },
    createdAt: '2024-01-15', logo: '', contactEmail: 'rahim@techhub.bd',
    contactPhone: '01711234567', address: 'Dhanmondi, Dhaka',
  },
  {
    id: 'shop_2', name: 'Fashionista BD', slug: 'fashionista-bd',
    description: 'Latest fashion trends for everyone — sarees, suits, jewelry and more',
    ownerId: 'adm_2', ownerName: 'Fatema Fashion', status: 'active',
    allowedCategories: ['cat_fashion', 'cat_beauty', 'cat_jewelry'],
    theme: { primaryColor: '#ec4899', accentColor: '#f43f5e', borderRadius: 'rounded', fontFamily: 'Poppins' },
    stats: { products: 125, orders: 891, revenue: 12450000, customers: 756 },
    createdAt: '2024-02-10', logo: '', contactEmail: 'fatema@fashionista.bd',
    contactPhone: '01812345678', address: 'Gulshan, Dhaka',
  },
  {
    id: 'shop_3', name: 'FreshMart', slug: 'freshmart',
    description: 'Fresh groceries, kids items and home essentials delivered to your door',
    ownerId: 'adm_3', ownerName: 'Karim Groceries', status: 'active',
    allowedCategories: ['cat_groceries', 'cat_home', 'cat_kids'],
    theme: { primaryColor: '#22c55e', accentColor: '#16a34a', borderRadius: 'sharp', fontFamily: 'Roboto' },
    stats: { products: 234, orders: 1456, revenue: 6780000, customers: 1123 },
    createdAt: '2024-03-05', logo: '', contactEmail: 'karim@freshmart.bd',
    contactPhone: '01987654321', address: 'Mirpur, Dhaka',
  },
  {
    id: 'shop_4', name: 'SportZone', slug: 'sportzone',
    description: 'Sports equipment and athletic wear for champions',
    ownerId: 'adm_4', ownerName: 'Nasir Sports', status: 'pending',
    allowedCategories: [],
    theme: { primaryColor: '#f97316', accentColor: '#ea580c', borderRadius: 'medium', fontFamily: 'Inter' },
    stats: { products: 0, orders: 0, revenue: 0, customers: 0 },
    createdAt: '2024-05-01', logo: '',
  },
  {
    id: 'shop_6', name: '1to99 Market', slug: '1to99-market',
    description: '1to99 Market — your neighbourhood bazaar. Electronics, clothing, groceries, accessories & more under one roof.',
    ownerId: 'adm_6', ownerName: '1to99 Admin', status: 'active',
    allowedCategories: ['cat_electronics', 'cat_fashion', 'cat_beauty', 'cat_jewelry', 'cat_groceries', 'cat_home', 'cat_kids', 'cat_sports', 'cat_books', 'cat_health'],
    theme: { primaryColor: '#f97316', accentColor: '#10b981', borderRadius: 'medium', fontFamily: 'Inter' },
    stats: { products: 120, orders: 890, revenue: 9500000, customers: 740 },
    createdAt: '2020-01-01', logo: '', contactEmail: 'admin.1to99@gmail.com',
    contactPhone: '01700001999', address: 'Mirpur, Dhaka',
    motto: 'Everything you need, all in one place.',
  },
  {
    id: 'shop_5', name: 'Mood On', slug: 'mood-on',
    description: "Laxmipur's most popular fashion brand since 2013 — Gents Clothing, Beauty & Style",
    ownerId: 'adm_5', ownerName: 'Shoga', status: 'active',
    allowedCategories: ['cat_fashion'],
    theme: { primaryColor: '#1a1a2e', accentColor: '#c9a84c', borderRadius: 'medium', fontFamily: 'Poppins' },
    stats: { products: 89, orders: 2340, revenue: 28500000, customers: 1876 },
    createdAt: '2013-01-01', logo: '/shops/mood-on-logo.jpg', contactEmail: 'moodon2013@gmail.com',
    contactPhone: '+880 1951-889205', address: 'Laxmipur, Bangladesh',
    motto: "A clothing line influenced by street fashion and urban styling in Bangladesh. Shop the latest trends in women's, men's, and children's clothing.",
    facebookPageUrl: 'https://www.facebook.com/moodon2013',
    facebookGroupUrl: 'https://www.facebook.com/groups/1118268952933494',
    activeSale: {
      name: 'Eid Special Sale', nameBn: 'ঈদ স্পেশাল সেল',
      discountPercent: 20, productIds: [],
    },
    activeCoverId: 'mood_street',
    broadcast: {
      text: '🔥 ঈদ স্পেশাল সেল — 20% ছাড়!  ⚡ সীমিত সময়ের অফার! 🛍️ এখনই কিনুন!',
      active: true,
    },
  },
]

const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'adm_6', name: '1to99 Market Admin', email: 'admin.1to99@gmail.com', phone: '01700001999',
    role: 'shop_admin', shopId: 'shop_6', shopName: '1to99 Market', status: 'active',
    permissions: ['manage_products', 'manage_orders', 'manage_inventory', 'view_analytics', 'manage_settings'],
    createdAt: '2020-01-01', lastLogin: '2026-05-24',
  },
  {
    id: 'adm_1', name: 'Rahim Tech', email: 'rahim@techhub.bd', phone: '01711234567',
    role: 'shop_admin', shopId: 'shop_1', shopName: 'TechHub BD', status: 'active',
    permissions: ['manage_products', 'manage_orders', 'view_analytics'],
    createdAt: '2024-01-15', lastLogin: '2026-05-18',
  },
  {
    id: 'adm_2', name: 'Fatema Fashion', email: 'fatema@fashionista.bd', phone: '01812345678',
    role: 'shop_admin', shopId: 'shop_2', shopName: 'Fashionista BD', status: 'active',
    permissions: ['manage_products', 'manage_orders', 'manage_inventory', 'view_analytics', 'manage_settings'],
    createdAt: '2024-02-10', lastLogin: '2026-05-19',
  },
  {
    id: 'adm_3', name: 'Karim Groceries', email: 'karim@freshmart.bd', phone: '01987654321',
    role: 'shop_admin', shopId: 'shop_3', shopName: 'FreshMart', status: 'active',
    permissions: ['manage_products', 'manage_orders', 'manage_inventory'],
    createdAt: '2024-03-05', lastLogin: '2026-05-17',
  },
  {
    id: 'adm_4', name: 'Nasir Sports', email: 'nasir@sportzone.bd', phone: '01723456789',
    role: 'shop_admin', shopId: 'shop_4', shopName: 'SportZone', status: 'pending',
    permissions: [],
    createdAt: '2024-05-01',
  },
  {
    id: 'adm_5', name: 'Sohag', email: 'Sohag.moodon@gmail.com', phone: '01700000000',
    role: 'shop_admin', shopId: 'shop_5', shopName: 'Mood On', status: 'active',
    permissions: ['manage_products', 'manage_orders', 'manage_inventory', 'view_analytics', 'manage_settings'],
    createdAt: '2013-01-01', lastLogin: '2026-05-20',
  },
]

const INITIAL_PRODUCTS: AdminProduct[] = [
  { id: 'p1', name: 'Samsung Galaxy S24', sku: 'SAM-S24-001', categoryId: 'cat_electronics', shopId: 'shop_1', price: 89999, stock: 15, lowStockThreshold: 5, status: 'active', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=85&fit=crop', description: 'Latest Samsung flagship smartphone', sold: 45, youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE' },
  { id: 'p2', name: 'Apple MacBook Air M2', sku: 'APL-MBA-M2', categoryId: 'cat_electronics', shopId: 'shop_1', price: 149999, stock: 8, lowStockThreshold: 3, status: 'active', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=85&fit=crop', description: 'Powerful lightweight laptop with M2 chip', sold: 23 },
  { id: 'p3', name: 'Sony WH-1000XM5', sku: 'SNY-HP-XM5', categoryId: 'cat_electronics', shopId: 'shop_1', price: 32999, stock: 3, lowStockThreshold: 5, status: 'active', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=85&fit=crop', description: 'Premium noise-canceling headphones', sold: 67 },
  { id: 'p4', name: 'Smart LED TV 55"', sku: 'TV-LED-55-001', categoryId: 'cat_electronics', shopId: 'shop_1', price: 74999, stock: 12, lowStockThreshold: 3, status: 'active', image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=85&fit=crop', description: '4K Smart TV with HDR', sold: 34 },
  { id: 'p5', name: 'Silk Saree Premium', sku: 'FSH-SAR-001', categoryId: 'cat_fashion', shopId: 'shop_2', price: 8999, stock: 24, lowStockThreshold: 5, status: 'active', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85&fit=crop', description: 'Pure silk saree with intricate design', sold: 156, youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE', facebookVideoUrl: 'https://www.facebook.com/facebook/videos/10153231379946729/' },
  { id: 'p6', name: "Men's Formal Suit", sku: 'FSH-SUT-001', categoryId: 'cat_fashion', shopId: 'shop_2', price: 12999, stock: 18, lowStockThreshold: 5, status: 'active', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=85&fit=crop', description: 'Premium formal suit set', sold: 89 },
  { id: 'p7', name: 'Gold Necklace Set', sku: 'JWL-GLD-001', categoryId: 'cat_jewelry', shopId: 'shop_2', price: 24999, stock: 7, lowStockThreshold: 3, status: 'active', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=85&fit=crop', description: '22K gold necklace set', sold: 34 },
  { id: 'p8', name: 'Organic Rice 5kg', sku: 'GRC-RIC-001', categoryId: 'cat_groceries', shopId: 'shop_3', price: 650, stock: 200, lowStockThreshold: 20, status: 'active', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=85&fit=crop', description: 'Premium organic rice', sold: 567 },
  { id: 'p9', name: 'Fresh Vegetables Box', sku: 'GRC-VEG-001', categoryId: 'cat_groceries', shopId: 'shop_3', price: 350, stock: 45, lowStockThreshold: 10, status: 'active', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=85&fit=crop', description: 'Seasonal mixed vegetables', sold: 890 },
  { id: 'p10', name: "Children's Learning Kit", sku: 'KDS-LRN-001', categoryId: 'cat_kids', shopId: 'shop_3', price: 1299, stock: 2, lowStockThreshold: 5, status: 'active', image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=85&fit=crop', description: 'Educational toys and activity kit', sold: 123 },
  { id: 'p11', name: 'Mood On Premium Panjabi', sku: 'MON-PNJ-001', categoryId: 'cat_fashion', subcategoryId: 'sub_mens_shirt', shopId: 'shop_5', price: 2499, costPrice: 1200, discountType: 'percent', discountValue: 20, stock: 45, lowStockThreshold: 10, status: 'active', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=85', images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=85', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=85'], description: 'Premium quality panjabi — perfect for Eid, Puja & all occasions', sold: 312, tags: ['bestseller', 'eid', 'premium'] },
  { id: 'p12', name: 'Mood On Gents Shirt (Summer)', sku: 'MON-SHT-002', categoryId: 'cat_fashion', subcategoryId: 'sub_mens_shirt', shopId: 'shop_5', price: 1299, stock: 80, lowStockThreshold: 15, status: 'active', image: 'https://images.unsplash.com/photo-1602810319428-019690571b5b?w=600&q=85', images: ['https://images.unsplash.com/photo-1602810319428-019690571b5b?w=600&q=85', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=85', 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=85'], description: 'Light cotton shirt perfect for Bangladesh summer', sold: 189, tags: ['summer', 'cotton'] },

  { id: 'p14', name: 'Mood On Winter Sweater', sku: 'MON-SWT-001', categoryId: 'cat_fashion', subcategoryId: 'sub_mens_shirt', shopId: 'shop_5', price: 3499, costPrice: 1800, stock: 30, lowStockThreshold: 5, status: 'active', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=85', images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=85', 'https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?w=600&q=85', 'https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=600&q=85'], description: 'Warm & stylish winter sweater for gents', sold: 98, tags: ['winter', 'warm'] },
  { id: 'p20', name: 'Casio MQ-24 Watch', sku: '1T99-WCH-001', categoryId: 'cat_fashion', shopId: 'shop_6', price: 1250, stock: 60, lowStockThreshold: 10, status: 'active', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85', description: 'Classic Casio digital watch', sold: 234 },
  { id: 'p21', name: 'Tupperware Lunch Box Set', sku: '1T99-HOM-001', categoryId: 'cat_home', shopId: 'shop_6', price: 950, stock: 120, lowStockThreshold: 20, status: 'active', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=85', description: 'Airtight 3-piece lunch box set', sold: 178 },
  { id: 'p22', name: 'Pilgrim V5 Pen (6-pack)', sku: '1T99-STN-001', categoryId: 'cat_books', shopId: 'shop_6', price: 180, stock: 500, lowStockThreshold: 50, status: 'active', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=85', description: 'Smooth ink roller pen set', sold: 980 },
  { id: 'p23', name: 'Sunsilk Shampoo 340ml', sku: '1T99-BTY-001', categoryId: 'cat_beauty', shopId: 'shop_6', price: 290, stock: 200, lowStockThreshold: 30, status: 'active', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&q=85', description: 'Thick & long hair shampoo', sold: 456 },
  { id: 'p24', name: 'Cricket Bat (Full Size)', sku: '1T99-SPT-001', categoryId: 'cat_sports', shopId: 'shop_6', price: 2200, stock: 35, lowStockThreshold: 5, status: 'active', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=85', description: 'Kashmir willow cricket bat', sold: 67 },
]

const INITIAL_ORDERS: Order[] = [
  { id: 'ord_1', orderNumber: 'TM-2026-001', shopId: 'shop_1', customerName: 'Abdur Rahman', customerPhone: '01711111111', customerAddress: 'House 12, Road 5, Dhanmondi, Dhaka', items: [{ name: 'Samsung Galaxy S24', qty: 1, price: 89999 }], subtotal: 89999, status: 'delivered', paymentMethod: 'cod', createdAt: '2026-05-10' },
  { id: 'ord_2', orderNumber: 'TM-2026-002', shopId: 'shop_1', customerName: 'Hosne Ara', customerPhone: '01812222222', customerAddress: 'Flat 3B, Gulshan Ave, Dhaka', items: [{ name: 'Sony WH-1000XM5', qty: 1, price: 32999 }, { name: 'Smart LED TV 55"', qty: 1, price: 74999 }], subtotal: 107998, status: 'processing', paymentMethod: 'cod', createdAt: '2026-05-18' },
  { id: 'ord_3', orderNumber: 'TM-2026-003', shopId: 'shop_2', customerName: 'Nasrin Begum', customerPhone: '01933333333', customerAddress: 'Block C, Mirpur 10, Dhaka', items: [{ name: 'Silk Saree Premium', qty: 2, price: 8999 }], subtotal: 17998, status: 'shipped', paymentMethod: 'cod', createdAt: '2026-05-17' },
  { id: 'ord_4', orderNumber: 'TM-2026-004', shopId: 'shop_2', customerName: 'Tariqul Islam', customerPhone: '01744444444', customerAddress: 'Sector 7, Uttara, Dhaka', items: [{ name: "Men's Formal Suit", qty: 1, price: 12999 }, { name: 'Gold Necklace Set', qty: 1, price: 24999 }], subtotal: 37998, status: 'pending', paymentMethod: 'cod', createdAt: '2026-05-19' },
  { id: 'ord_5', orderNumber: 'TM-2026-005', shopId: 'shop_3', customerName: 'Monira Khatun', customerPhone: '01855555555', customerAddress: 'House 8, Khilgaon, Dhaka', items: [{ name: 'Organic Rice 5kg', qty: 3, price: 650 }, { name: 'Fresh Vegetables Box', qty: 2, price: 350 }], subtotal: 2650, status: 'confirmed', paymentMethod: 'cod', createdAt: '2026-05-19' },
  { id: 'ord_6', orderNumber: 'TM-2026-006', shopId: 'shop_1', customerName: 'Kamal Hossain', customerPhone: '01966666666', customerAddress: 'Road 12, Banani, Dhaka', items: [{ name: 'Apple MacBook Air M2', qty: 1, price: 149999 }], subtotal: 149999, status: 'pending', paymentMethod: 'cod', createdAt: '2026-05-19' },
  { id: 'ord_7', orderNumber: 'TM-2026-007', shopId: 'shop_3', customerName: 'Sumaiya Akter', customerPhone: '01677777777', customerAddress: 'Mohammadpur, Dhaka', items: [{ name: "Children's Learning Kit", qty: 2, price: 1299 }], subtotal: 2598, status: 'pending', paymentMethod: 'cod', createdAt: '2026-05-19' },
  { id: 'ord_8', orderNumber: 'MON-2026-001', shopId: 'shop_5', customerName: 'Rakibul Hasan', customerPhone: '01812345001', customerAddress: 'Laxmipur Sadar, Laxmipur', items: [{ name: 'Mood On Premium Panjabi', qty: 2, price: 1999 }], subtotal: 3998, status: 'pending', paymentMethod: 'cod', createdAt: '2026-05-21' },
  { id: 'ord_9', orderNumber: 'MON-2026-002', shopId: 'shop_5', customerName: 'Farida Begum', customerPhone: '01933456002', customerAddress: 'Raipur, Laxmipur', items: [{ name: 'Mood On Gents Shirt (Summer)', qty: 1, price: 1299 }, { name: 'Mood On Winter Sweater', qty: 1, price: 3499 }], subtotal: 4798, status: 'confirmed', paymentMethod: 'cod', createdAt: '2026-05-20' },
  { id: 'ord_10', orderNumber: 'MON-2026-003', shopId: 'shop_5', customerName: 'Jahangir Alam', customerPhone: '01711987003', customerAddress: 'Ramganj, Laxmipur', items: [{ name: 'Mood On Premium Panjabi', qty: 1, price: 1999 }], subtotal: 1999, status: 'pending', paymentMethod: 'cod', createdAt: '2026-05-20' },
]

type ShopUpdater = Shop[] | ((prev: Shop[]) => Shop[])

interface AdminStore {
  shops: Shop[]
  adminUsers: AdminUser[]
  products: AdminProduct[]
  orders: Order[]
  setShops: (shops: ShopUpdater) => void
  setAdminUsers: (users: AdminUser[]) => void
  setProducts: (products: AdminProduct[]) => void
  setOrders: (orders: Order[]) => void
}

const StoreCtx = createContext<AdminStore>({
  shops: [], adminUsers: [], products: [], orders: [],
  setShops: () => {}, setAdminUsers: () => {}, setProducts: () => {}, setOrders: () => {},
})

/** Demo persistence until a real API exists (same browser only). */
const PRODUCTS_LOCAL_KEY = 'banglaflow_admin_products_v2'
const SHOPS_LOCAL_KEY = 'banglaflow_admin_shops_v2'

const REMOVED_PRODUCT_IDS = new Set(['p13', 'p15'])

function mergeProducts(stored: AdminProduct[]): AdminProduct[] {
  const filtered = stored.filter(p => !REMOVED_PRODUCT_IDS.has(p.id))
  const storedMap = new Map(filtered.map(p => [p.id, p]))
  const initialMerged = INITIAL_PRODUCTS.map(p => storedMap.get(p.id) ?? p)
  const initialIds = new Set(INITIAL_PRODUCTS.map(p => p.id))
  const additions = filtered.filter(p => !initialIds.has(p.id))
  return [...initialMerged, ...additions]
}

function mergeShops(stored: Shop[]): Shop[] {
  const storedMap = new Map(stored.map(s => [s.id, s]))
  const initialMerged = INITIAL_SHOPS.map(s => storedMap.get(s.id) ?? s)
  const initialIds = new Set(INITIAL_SHOPS.map(s => s.id))
  const additions = stored.filter(s => !initialIds.has(s.id))
  return [...initialMerged, ...additions]
}

function parseStoredShops(raw: string): Shop[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    const first = parsed[0] as Record<string, unknown>
    if (typeof first?.id !== 'string' || !Array.isArray(first?.allowedCategories)) return null
    return parsed as Shop[]
  } catch {
    return null
  }
}

function parseStoredProducts(raw: string): AdminProduct[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    const first = parsed[0] as Record<string, unknown>
    if (typeof first?.id !== 'string' || typeof first?.shopId !== 'string') return null
    return parsed as AdminProduct[]
  } catch {
    return null
  }
}

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [shops, setShopsState] = useState<Shop[]>(INITIAL_SHOPS)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMINS)
  const [products, setProductsState] = useState<AdminProduct[]>(INITIAL_PRODUCTS)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const rawShops = localStorage.getItem(SHOPS_LOCAL_KEY)
      if (rawShops) {
        const loadedShops = parseStoredShops(rawShops)
        if (loadedShops) setShopsState(mergeShops(loadedShops))
      }
      const rawProducts = localStorage.getItem(PRODUCTS_LOCAL_KEY)
      if (rawProducts) {
        const loadedProducts = parseStoredProducts(rawProducts)
        if (loadedProducts) setProductsState(mergeProducts(loadedProducts))
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    function onStorage(e: StorageEvent) {
      if (!e.newValue) return
      if (e.key === SHOPS_LOCAL_KEY) {
        const loaded = parseStoredShops(e.newValue)
        if (loaded) setShopsState(mergeShops(loaded))
      } else if (e.key === PRODUCTS_LOCAL_KEY) {
        const loaded = parseStoredProducts(e.newValue)
        if (loaded) setProductsState(mergeProducts(loaded))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setShops = useCallback((next: ShopUpdater) => {
    setShopsState(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(SHOPS_LOCAL_KEY, JSON.stringify(resolved))
        } catch {
          /* quota / private mode */
        }
      }
      return resolved
    })
  }, [])

  const setProducts = useCallback((next: AdminProduct[]) => {
    setProductsState(next)
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(PRODUCTS_LOCAL_KEY, JSON.stringify(next))
    } catch {
      /* quota / private mode */
    }
  }, [])

  return (
    <StoreCtx.Provider value={{ shops, adminUsers, products, orders, setShops, setAdminUsers, setProducts, setOrders }}>
      {children}
    </StoreCtx.Provider>
  )
}

export const useAdminStore = () => useContext(StoreCtx)

export const fmt = (n: number) => '৳' + n.toLocaleString('en-BD')

export function effectivePrice(p: AdminProduct): number {
  if (!p.discountValue || !p.discountType) return p.price
  if (p.discountType === 'percent') return Math.round(p.price * (1 - p.discountValue / 100))
  return Math.max(0, p.price - p.discountValue)
}

/** Admin set a percent or fixed amount off the list price (used on storefront). */
export function hasProductDiscount(p: AdminProduct): boolean {
  return Boolean(p.discountType && p.discountValue != null && p.discountValue > 0)
}

export function profitAmount(p: AdminProduct): number {
  if (!p.costPrice) return 0
  return effectivePrice(p) - p.costPrice
}

export function discountBadgeText(p: AdminProduct, lang: 'en' | 'bn'): string | null {
  if (!hasProductDiscount(p)) return null
  if (p.discountType === 'percent') return `${p.discountValue}% ${lang === 'en' ? 'OFF' : 'ছাড়'}`
  return `৳${p.discountValue!.toLocaleString('en-BD')} ${lang === 'en' ? 'OFF' : 'ছাড়'}`
}
