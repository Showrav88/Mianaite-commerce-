export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: { en: string; bn: string };
  description: { en: string; bn: string };
  category: string; // category id
  brand: string;
  price: number; // selling price BDT
  retailPrice: number; // original
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[]; // url strings (unsplash)
  tags?: ("bestseller" | "new" | "flash")[];
  specs?: { en: string; bn: string; value: string }[];
}

export interface Category {
  id: string;
  slug: string;
  name: { en: string; bn: string };
  icon: string; // emoji for now
  image: string;
}

export const categories: Category[] = [
  { id: "electronics", slug: "electronics", name: { en: "Electronics", bn: "ইলেকট্রনিক্স" }, icon: "📱", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80" },
  { id: "fashion", slug: "fashion", name: { en: "Fashion", bn: "ফ্যাশন" }, icon: "👗", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80" },
  { id: "groceries", slug: "groceries", name: { en: "Groceries", bn: "গ্রোসারি" }, icon: "🛒", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80" },
  { id: "home", slug: "home", name: { en: "Home & Living", bn: "হোম ও লিভিং" }, icon: "🛋️", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80" },
  { id: "beauty", slug: "beauty", name: { en: "Beauty", bn: "বিউটি" }, icon: "💄", image: "https://images.unsplash.com/photo-1522335789203-aaa2f6bba8f3?w=600&q=80" },
  { id: "kids", slug: "kids", name: { en: "Kids", bn: "শিশু" }, icon: "🧸", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80" },
  { id: "sports", slug: "sports", name: { en: "Sports", bn: "স্পোর্টস" }, icon: "⚽", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80" },
  { id: "books", slug: "books", name: { en: "Books", bn: "বই" }, icon: "📚", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80" },
];

const img = (id: string, w = 800) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const products: Product[] = [
  {
    id: "p1", slug: "wireless-bluetooth-headphones", sku: "TM-EL-001",
    name: { en: "Wireless Bluetooth Headphones", bn: "ওয়্যারলেস ব্লুটুথ হেডফোন" },
    description: { en: "Premium over-ear headphones with active noise cancellation, 30-hour battery, and crystal-clear sound.", bn: "নয়েজ ক্যান্সেলেশন, ৩০ ঘণ্টা ব্যাটারি ব্যাকআপ এবং স্বচ্ছ সাউন্ডসহ প্রিমিয়াম হেডফোন।" },
    category: "electronics", brand: "SoundPro", price: 2490, retailPrice: 3990, stock: 24, rating: 4.6, reviewCount: 184,
    images: [img("photo-1505740420928-5e560c06d30e"), img("photo-1583394838336-acd977736f90")],
    tags: ["bestseller", "flash"],
    specs: [
      { en: "Battery", bn: "ব্যাটারি", value: "30 hrs" },
      { en: "Driver", bn: "ড্রাইভার", value: "40mm" },
      { en: "Connection", bn: "কানেকশন", value: "Bluetooth 5.3" },
    ],
  },
  {
    id: "p2", slug: "smart-fitness-watch", sku: "TM-EL-002",
    name: { en: "Smart Fitness Watch", bn: "স্মার্ট ফিটনেস ওয়াচ" },
    description: { en: "Track heart rate, sleep, and 100+ sport modes. 1.85\" AMOLED, IP68 waterproof.", bn: "হার্ট রেট, ঘুম এবং ১০০+ স্পোর্ট মোড ট্র্যাক করুন। ১.৮৫\" AMOLED, IP68 ওয়াটারপ্রুফ।" },
    category: "electronics", brand: "FitX", price: 3200, retailPrice: 4500, stock: 12, rating: 4.4, reviewCount: 96,
    images: [img("photo-1546868871-7041f2a55e12"), img("photo-1579586337278-3befd40fd17a")],
    tags: ["new", "flash"],
  },
  {
    id: "p3", slug: "cotton-panjabi-eid", sku: "TM-FA-001",
    name: { en: "Premium Cotton Panjabi", bn: "প্রিমিয়াম কটন পাঞ্জাবি" },
    description: { en: "Handcrafted soft cotton panjabi, perfect for Eid and special occasions. Available in multiple colors.", bn: "নরম কটন কাপড়ে হস্তনির্মিত পাঞ্জাবি, ঈদ ও বিশেষ অনুষ্ঠানের জন্য আদর্শ।" },
    category: "fashion", brand: "Aarong Style", price: 1850, retailPrice: 2500, stock: 38, rating: 4.7, reviewCount: 212,
    images: [img("photo-1622445275576-721325763afe"), img("photo-1581655353564-df123a1eb820")],
    tags: ["bestseller"],
  },
  {
    id: "p4", slug: "womens-silk-saree", sku: "TM-FA-002",
    name: { en: "Handloom Silk Saree", bn: "হ্যান্ডলুম সিল্ক শাড়ি" },
    description: { en: "Traditional Bangladeshi handloom silk saree with intricate border work.", bn: "ঐতিহ্যবাহী হ্যান্ডলুম সিল্ক শাড়ি, সূক্ষ্ম পাড়ের কাজসহ।" },
    category: "fashion", brand: "Tangail Weaves", price: 4500, retailPrice: 5800, stock: 9, rating: 4.8, reviewCount: 145,
    images: [img("photo-1610030469983-98e550d6193c"), img("photo-1583391733956-6c78276477e2")],
    tags: ["bestseller"],
  },
  {
    id: "p5", slug: "basmati-rice-5kg", sku: "TM-GR-001",
    name: { en: "Premium Basmati Rice 5kg", bn: "প্রিমিয়াম বাসমতি চাল ৫ কেজি" },
    description: { en: "Long-grain aromatic basmati rice. Aged for perfect texture and aroma.", bn: "লম্বা দানার সুগন্ধি বাসমতি চাল। নিখুঁত স্বাদ ও গন্ধের জন্য পরিপক্ক।" },
    category: "groceries", brand: "Pran", price: 850, retailPrice: 950, stock: 200, rating: 4.5, reviewCount: 432,
    images: [img("photo-1586201375761-83865001e31c"), img("photo-1536304993881-ff6e9eefa2a6")],
    tags: ["bestseller"],
  },
  {
    id: "p6", slug: "pure-mustard-oil-1l", sku: "TM-GR-002",
    name: { en: "Pure Mustard Oil 1L", bn: "খাঁটি সরিষার তেল ১ লিটার" },
    description: { en: "Cold-pressed pure mustard oil. No additives, full traditional flavor.", bn: "কোল্ড প্রেসড খাঁটি সরিষার তেল। কোনো কৃত্রিম উপাদান ছাড়া।" },
    category: "groceries", brand: "Radhuni", price: 320, retailPrice: 380, stock: 150, rating: 4.6, reviewCount: 287,
    images: [img("photo-1474979266404-7eaacbcd87c5"), img("photo-1611709497463-67c3a93c9d49")],
  },
  {
    id: "p7", slug: "modern-table-lamp", sku: "TM-HM-001",
    name: { en: "Minimal Wooden Table Lamp", bn: "মিনিমাল কাঠের টেবিল ল্যাম্প" },
    description: { en: "Warm-light wooden base lamp. Perfect for bedside or study desk.", bn: "উষ্ণ আলোর কাঠের টেবিল ল্যাম্প। বেডসাইড বা পড়ার টেবিলের জন্য আদর্শ।" },
    category: "home", brand: "Nordic", price: 1450, retailPrice: 2200, stock: 18, rating: 4.5, reviewCount: 67,
    images: [img("photo-1507473885765-e6ed057f782c"), img("photo-1513506003901-1e6a229e2d15")],
    tags: ["new"],
  },
  {
    id: "p8", slug: "ceramic-dinner-set", sku: "TM-HM-002",
    name: { en: "Ceramic Dinner Set (24 pcs)", bn: "সিরামিক ডিনার সেট (২৪ পিস)" },
    description: { en: "Elegant 24-piece ceramic dinner set for 6 people. Microwave & dishwasher safe.", bn: "৬ জনের জন্য ২৪ পিস সিরামিক ডিনার সেট। মাইক্রোওয়েভ ও ডিশওয়াশার সেফ।" },
    category: "home", brand: "Shinepukur", price: 3850, retailPrice: 4900, stock: 7, rating: 4.7, reviewCount: 89,
    images: [img("photo-1603199506016-b9a594b593c0"), img("photo-1578749556568-bc2c40e68b61")],
  },
  {
    id: "p9", slug: "vitamin-c-face-serum", sku: "TM-BE-001",
    name: { en: "Vitamin C Brightening Serum", bn: "ভিটামিন সি ব্রাইটেনিং সিরাম" },
    description: { en: "Brighten and even skin tone with 15% Vitamin C and hyaluronic acid.", bn: "১৫% ভিটামিন সি এবং হায়ালুরোনিক অ্যাসিডসহ ত্বক উজ্জ্বল করুন।" },
    category: "beauty", brand: "GlowLab", price: 990, retailPrice: 1500, stock: 45, rating: 4.4, reviewCount: 156,
    images: [img("photo-1620916566398-39f1143ab7be"), img("photo-1556228720-195a672e8a03")],
    tags: ["flash"],
  },
  {
    id: "p10", slug: "matte-lipstick-set", sku: "TM-BE-002",
    name: { en: "Matte Lipstick Set of 6", bn: "ম্যাট লিপস্টিক সেট (৬টি)" },
    description: { en: "Long-lasting matte finish lipstick set in 6 trending shades.", bn: "৬টি ট্রেন্ডিং শেডে দীর্ঘস্থায়ী ম্যাট লিপস্টিক সেট।" },
    category: "beauty", brand: "Bella", price: 750, retailPrice: 1200, stock: 60, rating: 4.3, reviewCount: 198,
    images: [img("photo-1586495777744-4413f21062fa"), img("photo-1631214524020-7e18db9a8f92")],
    tags: ["new"],
  },
  {
    id: "p11", slug: "kids-building-blocks", sku: "TM-KD-001",
    name: { en: "Creative Building Blocks (200 pcs)", bn: "ক্রিয়েটিভ বিল্ডিং ব্লকস (২০০ পিস)" },
    description: { en: "200-piece colorful building blocks to spark creativity. Ages 3+.", bn: "২০০ পিস রঙিন বিল্ডিং ব্লকস, সৃজনশীলতা বাড়াতে। ৩+ বছর।" },
    category: "kids", brand: "PlayJoy", price: 1290, retailPrice: 1800, stock: 22, rating: 4.6, reviewCount: 78,
    images: [img("photo-1587654780291-39c9404d746b"), img("photo-1558877385-8c1b8d3a3e92")],
  },
  {
    id: "p12", slug: "football-size-5", sku: "TM-SP-001",
    name: { en: "Professional Football Size 5", bn: "প্রফেশনাল ফুটবল সাইজ ৫" },
    description: { en: "FIFA-quality match football. Durable PU leather, great grip on all surfaces.", bn: "ফিফা কোয়ালিটি ম্যাচ ফুটবল। টেকসই PU চামড়া।" },
    category: "sports", brand: "Bashundhara", price: 1100, retailPrice: 1500, stock: 30, rating: 4.5, reviewCount: 112,
    images: [img("photo-1614632537190-23e4146777db"), img("photo-1551958219-acbc608c6377")],
  },
];

export const findProduct = (slug: string) => products.find((p) => p.slug === slug);
export const productsByCategory = (catId: string) => products.filter((p) => p.category === catId);
export const flashSaleProducts = () => products.filter((p) => p.tags?.includes("flash"));
export const newArrivals = () => products.filter((p) => p.tags?.includes("new"));
export const bestSellers = () => products.filter((p) => p.tags?.includes("bestseller"));
export const discountPercent = (p: Product) => Math.round(((p.retailPrice - p.price) / p.retailPrice) * 100);
