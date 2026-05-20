import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

const dict = {
  en: {
    "nav.home": "Home", "nav.products": "All Products", "nav.cart": "Cart", "nav.search": "Search products, brands, categories...",
    "hero.tag": "Bangladesh's Everyday Marketplace",
    "hero.title": "Shop Smarter.\nSave Bigger.",
    "hero.desc": "From electronics to fashion to fresh groceries — get everything you need delivered to your doorstep across Bangladesh.",
    "hero.cta": "Shop Now", "hero.cta2": "Browse Categories",
    "section.categories": "Shop by Category",
    "section.flash": "Flash Sale", "section.flash.desc": "Hot deals, limited time",
    "section.featured": "Featured Products",
    "section.trending": "Trending Now",
    "section.new": "New Arrivals",
    "section.reviews": "What Customers Say",
    "card.add": "Add to Cart", "card.added": "Added",
    "card.viewAll": "View all",
    "stock.in": "In stock", "stock.low": "Only {n} left", "stock.out": "Out of stock",
    "filters.title": "Filters", "filters.category": "Category", "filters.price": "Price range", "filters.all": "All",
    "sort.label": "Sort by", "sort.popular": "Popular", "sort.priceAsc": "Price: Low to High", "sort.priceDesc": "Price: High to Low", "sort.new": "Newest",
    "pd.desc": "Description", "pd.specs": "Specifications", "pd.related": "Related products",
    "pd.qty": "Quantity", "pd.buy": "Buy Now", "pd.share": "Share", "pd.sku": "SKU",
    "cart.title": "Your Cart", "cart.empty": "Your cart is empty", "cart.continue": "Continue shopping",
    "cart.subtotal": "Subtotal", "cart.shipping": "Shipping", "cart.total": "Total", "cart.coupon": "Coupon code", "cart.apply": "Apply",
    "cart.checkout": "Proceed to Checkout", "cart.remove": "Remove", "cart.free": "Free",
    "co.title": "Checkout", "co.contact": "Contact & Delivery", "co.name": "Full name", "co.phone": "Phone number",
    "co.address": "Full address (House, Road, Area, City, District)", "co.note": "Order note (optional)",
    "co.payment": "Payment method", "co.cod": "Cash on Delivery", "co.cod.desc": "Pay when you receive your order",
    "co.summary": "Order summary", "co.place": "Place Order", "co.items": "items",
    "success.title": "Order Placed!", "success.desc": "Thank you for your order. We'll call you to confirm shortly.",
    "success.id": "Order ID", "success.home": "Back to home",
    "footer.about": "About AITeShops", "footer.aboutDesc": "Bangladesh's friendly everyday marketplace. Fast delivery, fair prices, real support.",
    "footer.shop": "Shop", "footer.help": "Help", "footer.legal": "Legal",
    "footer.contact": "Contact us", "footer.faq": "FAQ", "footer.returns": "Return policy",
    "footer.privacy": "Privacy policy", "footer.terms": "Terms & conditions",
    "footer.newsletter": "Get deals in your inbox", "footer.subscribe": "Subscribe",
    "footer.rights": "All rights reserved.",
    "badge.bestseller": "Bestseller", "badge.new": "New", "badge.sale": "-{n}%",
    "common.off": "OFF",
    "admin.dashboard": "Dashboard", "admin.products": "Products", "admin.orders": "Orders",
    "admin.inventory": "Inventory", "admin.customers": "Customers", "admin.settings": "Settings",
    "admin.shops": "Shops", "admin.admins": "Admins", "admin.categories": "Categories",
    "admin.customization": "Customization", "admin.analytics": "Analytics",
    "admin.logout": "Logout", "admin.visitStore": "Visit Store",
    "admin.welcome": "Welcome back", "admin.todayOrders": "Today's Orders",
    "admin.revenue": "Revenue", "admin.lowStock": "Low Stock", "admin.outOfStock": "Out of Stock",
    "admin.addProduct": "Add Product", "admin.editProduct": "Edit Product",
    "admin.status.pending": "Pending", "admin.status.processing": "Processing",
    "admin.status.shipped": "Shipped", "admin.status.delivered": "Delivered",
    "admin.status.cancelled": "Cancelled", "admin.status.confirmed": "Confirmed",
    "admin.status.active": "Active", "admin.status.inactive": "Inactive",
    "admin.super.title": "Super Admin", "admin.super.platform": "Platform Overview",
    "admin.super.totalShops": "Total Shops", "admin.super.totalAdmins": "Total Admins",
    "admin.super.platformRevenue": "Platform Revenue", "admin.super.totalProducts": "Total Products",
    "admin.save": "Save Changes", "admin.cancel": "Cancel", "admin.delete": "Delete",
    "admin.edit": "Edit", "admin.add": "Add", "admin.search": "Search",
    "admin.name": "Name", "admin.email": "Email", "admin.phone": "Phone",
    "admin.price": "Price", "admin.stock": "Stock", "admin.actions": "Actions",
    "admin.shopName": "Shop Name", "admin.owner": "Owner", "admin.permissions": "Permissions",
    "admin.inviteAdmin": "Invite Admin", "admin.addShop": "Add Shop",
    "admin.categoryAccess": "Category Access Control", "admin.shopTheme": "Shop Theme",
    "admin.profile": "Shop Profile", "admin.theme": "Theme & Design", "admin.contact": "Contact Info",
    "admin.restock": "Restock",
    "admin.sell": "Counter Sale",
  },
  bn: {
    "nav.home": "হোম", "nav.products": "সকল পণ্য", "nav.cart": "কার্ট", "nav.search": "পণ্য, ব্র্যান্ড, ক্যাটাগরি খুঁজুন...",
    "hero.tag": "বাংলাদেশের দৈনন্দিন মার্কেটপ্লেস",
    "hero.title": "স্মার্ট কেনাকাটা।\nবড় সাশ্রয়।",
    "hero.desc": "ইলেকট্রনিক্স থেকে ফ্যাশন, গ্রোসারি সবকিছু পেয়ে যান বাংলাদেশের যেকোনো প্রান্তে আপনার দরজায়।",
    "hero.cta": "এখনই কিনুন", "hero.cta2": "ক্যাটাগরি দেখুন",
    "section.categories": "ক্যাটাগরি অনুযায়ী",
    "section.flash": "ফ্ল্যাশ সেল", "section.flash.desc": "সীমিত সময়ের বিশেষ অফার",
    "section.featured": "ফিচার্ড পণ্য",
    "section.trending": "ট্রেন্ডিং",
    "section.new": "নতুন এসেছে",
    "section.reviews": "ক্রেতাদের মতামত",
    "card.add": "কার্টে যোগ", "card.added": "যোগ হয়েছে",
    "card.viewAll": "সব দেখুন",
    "stock.in": "স্টকে আছে", "stock.low": "মাত্র {n} টি বাকি", "stock.out": "স্টক শেষ",
    "filters.title": "ফিল্টার", "filters.category": "ক্যাটাগরি", "filters.price": "দামের পরিসর", "filters.all": "সব",
    "sort.label": "সাজান", "sort.popular": "জনপ্রিয়", "sort.priceAsc": "দাম: কম থেকে বেশি", "sort.priceDesc": "দাম: বেশি থেকে কম", "sort.new": "নতুন",
    "pd.desc": "বিবরণ", "pd.specs": "স্পেসিফিকেশন", "pd.related": "সম্পর্কিত পণ্য",
    "pd.qty": "পরিমাণ", "pd.buy": "এখনই কিনুন", "pd.share": "শেয়ার", "pd.sku": "এসকেইউ",
    "cart.title": "আপনার কার্ট", "cart.empty": "আপনার কার্ট খালি", "cart.continue": "কেনাকাটা চালিয়ে যান",
    "cart.subtotal": "সাবটোটাল", "cart.shipping": "ডেলিভারি চার্জ", "cart.total": "মোট", "cart.coupon": "কুপন কোড", "cart.apply": "প্রয়োগ",
    "cart.checkout": "চেকআউটে যান", "cart.remove": "সরান", "cart.free": "ফ্রি",
    "co.title": "চেকআউট", "co.contact": "যোগাযোগ ও ডেলিভারি", "co.name": "পূর্ণ নাম", "co.phone": "ফোন নম্বর",
    "co.address": "পূর্ণ ঠিকানা (বাড়ি, রোড, এলাকা, শহর, জেলা)", "co.note": "অর্ডার নোট (ঐচ্ছিক)",
    "co.payment": "পেমেন্ট পদ্ধতি", "co.cod": "ক্যাশ অন ডেলিভারি", "co.cod.desc": "পণ্য পাওয়ার পর মূল্য পরিশোধ করুন",
    "co.summary": "অর্ডার সামারি", "co.place": "অর্ডার নিশ্চিত করুন", "co.items": "টি পণ্য",
    "success.title": "অর্ডার সফল!", "success.desc": "ধন্যবাদ! আমরা শীঘ্রই কনফার্ম করার জন্য কল করব।",
    "success.id": "অর্ডার আইডি", "success.home": "হোমে ফিরুন",
    "footer.about": "AITeShops সম্পর্কে", "footer.aboutDesc": "বাংলাদেশের বন্ধুত্বপূর্ণ দৈনন্দিন মার্কেটপ্লেস। দ্রুত ডেলিভারি, ন্যায্য দাম।",
    "footer.shop": "শপ", "footer.help": "সহায়তা", "footer.legal": "নীতিমালা",
    "footer.contact": "যোগাযোগ", "footer.faq": "প্রশ্নোত্তর", "footer.returns": "রিটার্ন নীতি",
    "footer.privacy": "প্রাইভেসি নীতি", "footer.terms": "শর্তাবলী",
    "footer.newsletter": "ইমেইলে অফার পান", "footer.subscribe": "সাবস্ক্রাইব",
    "footer.rights": "সর্বস্বত্ব সংরক্ষিত।",
    "badge.bestseller": "বেস্টসেলার", "badge.new": "নতুন", "badge.sale": "-{n}%",
    "common.off": "ছাড়",
    "admin.dashboard": "ড্যাশবোর্ড", "admin.products": "পণ্যসমূহ", "admin.orders": "অর্ডারসমূহ",
    "admin.inventory": "ইনভেন্টরি", "admin.customers": "গ্রাহকগণ", "admin.settings": "সেটিংস",
    "admin.shops": "শপসমূহ", "admin.admins": "অ্যাডমিনগণ", "admin.categories": "ক্যাটাগরিসমূহ",
    "admin.customization": "কাস্টমাইজেশন", "admin.analytics": "বিশ্লেষণ",
    "admin.logout": "লগআউট", "admin.visitStore": "স্টোর দেখুন",
    "admin.welcome": "স্বাগতম", "admin.todayOrders": "আজকের অর্ডার",
    "admin.revenue": "আয়", "admin.lowStock": "কম স্টক", "admin.outOfStock": "স্টক শেষ",
    "admin.addProduct": "পণ্য যোগ করুন", "admin.editProduct": "পণ্য সম্পাদনা",
    "admin.status.pending": "অপেক্ষমান", "admin.status.processing": "প্রক্রিয়াধীন",
    "admin.status.shipped": "পাঠানো হয়েছে", "admin.status.delivered": "ডেলিভারি হয়েছে",
    "admin.status.cancelled": "বাতিল", "admin.status.confirmed": "নিশ্চিত হয়েছে",
    "admin.status.active": "সক্রিয়", "admin.status.inactive": "নিষ্ক্রিয়",
    "admin.super.title": "সুপার অ্যাডমিন", "admin.super.platform": "প্ল্যাটফর্ম ওভারভিউ",
    "admin.super.totalShops": "মোট শপ", "admin.super.totalAdmins": "মোট অ্যাডমিন",
    "admin.super.platformRevenue": "প্ল্যাটফর্ম আয়", "admin.super.totalProducts": "মোট পণ্য",
    "admin.save": "সংরক্ষণ করুন", "admin.cancel": "বাতিল", "admin.delete": "মুছুন",
    "admin.edit": "সম্পাদনা", "admin.add": "যোগ করুন", "admin.search": "খুঁজুন",
    "admin.name": "নাম", "admin.email": "ইমেইল", "admin.phone": "ফোন",
    "admin.price": "দাম", "admin.stock": "স্টক", "admin.actions": "অ্যাকশন",
    "admin.shopName": "শপের নাম", "admin.owner": "মালিক", "admin.permissions": "অনুমতি",
    "admin.inviteAdmin": "অ্যাডমিন আমন্ত্রণ", "admin.addShop": "শপ যোগ করুন",
    "admin.categoryAccess": "ক্যাটাগরি অ্যাক্সেস নিয়ন্ত্রণ", "admin.shopTheme": "শপ থিম",
    "admin.profile": "শপ প্রোফাইল", "admin.theme": "থিম ও ডিজাইন", "admin.contact": "যোগাযোগ তথ্য",
    "admin.restock": "পুনঃস্টক",
    "admin.sell": "কাউন্টার বিক্রি",
  },
} as const;

type Key = keyof typeof dict.en;

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (k: Key, vars?: Record<string, string | number>) => string; }
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null;
    if (saved) setLangState(saved);
  }, []);
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem("lang", l); } catch {} };
  const t = (k: Key, vars?: Record<string, string | number>) => {
    let s: string = (dict[lang][k] as string) ?? (dict.en[k] as string) ?? k;
    if (vars) for (const [key, val] of Object.entries(vars)) s = s.replace(`{${key}}`, String(val));
    return s;
  };
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function formatBDT(amount: number, lang: Lang = "en") {
  const formatted = new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-BD", { maximumFractionDigits: 0 }).format(amount);
  return `৳${formatted}`;
}
