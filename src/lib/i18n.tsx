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
    "footer.about": "About TrendMart", "footer.aboutDesc": "Bangladesh's friendly everyday marketplace. Fast delivery, fair prices, real support.",
    "footer.shop": "Shop", "footer.help": "Help", "footer.legal": "Legal",
    "footer.contact": "Contact us", "footer.faq": "FAQ", "footer.returns": "Return policy",
    "footer.privacy": "Privacy policy", "footer.terms": "Terms & conditions",
    "footer.newsletter": "Get deals in your inbox", "footer.subscribe": "Subscribe",
    "footer.rights": "All rights reserved.",
    "badge.bestseller": "Bestseller", "badge.new": "New", "badge.sale": "-{n}%",
    "common.off": "OFF",
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
    "footer.about": "ট্রেন্ডমার্ট সম্পর্কে", "footer.aboutDesc": "বাংলাদেশের বন্ধুত্বপূর্ণ দৈনন্দিন মার্কেটপ্লেস। দ্রুত ডেলিভারি, ন্যায্য দাম।",
    "footer.shop": "শপ", "footer.help": "সহায়তা", "footer.legal": "নীতিমালা",
    "footer.contact": "যোগাযোগ", "footer.faq": "প্রশ্নোত্তর", "footer.returns": "রিটার্ন নীতি",
    "footer.privacy": "প্রাইভেসি নীতি", "footer.terms": "শর্তাবলী",
    "footer.newsletter": "ইমেইলে অফার পান", "footer.subscribe": "সাবস্ক্রাইব",
    "footer.rights": "সর্বস্বত্ব সংরক্ষিত।",
    "badge.bestseller": "বেস্টসেলার", "badge.new": "নতুন", "badge.sale": "-{n}%",
    "common.off": "ছাড়",
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
