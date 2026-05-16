import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { categories } from "@/lib/products";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { count } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q: q || undefined, cat: undefined } as never });
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
      {/* Top strip */}
      <div className="bg-primary text-primary-foreground text-xs">
        <div className="container mx-auto px-4 py-1.5 flex justify-between items-center">
          <span className="hidden sm:inline">📞 16770 • {lang === "en" ? "Free delivery over ৳1500" : "৳১৫০০ এর বেশি অর্ডারে ফ্রি ডেলিভারি"}</span>
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded transition"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "en" ? "বাংলা" : "English"}
          </button>
        </div>
      </div>

      {/* Main bar */}
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center text-primary-foreground font-bold text-lg shadow-[var(--shadow-hover)]">
            T
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline">TrendMart</span>
        </Link>

        <form onSubmit={submitSearch} className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("nav.search")}
            className="w-full pl-10 pr-20 py-2.5 rounded-full bg-secondary border border-transparent focus:bg-background focus:border-primary outline-none transition text-sm"
          />
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-sm font-medium hover:opacity-90">
            {lang === "en" ? "Search" : "খুঁজুন"}
          </button>
        </form>

        <Link to="/cart" className="relative p-2 hover:bg-secondary rounded-lg transition">
          <ShoppingCart className="w-6 h-6" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] grid place-items-center px-1">
              {count}
            </span>
          )}
        </Link>

        <button className="lg:hidden p-2 hover:bg-secondary rounded-lg" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Category nav */}
      <nav className={`border-t ${open ? "block" : "hidden lg:block"}`}>
        <div className="container mx-auto px-4 flex flex-wrap items-center gap-1 py-2">
          <Link to="/" className="px-3 py-1.5 text-sm font-medium hover:text-primary [&.active]:text-primary">
            {t("nav.home")}
          </Link>
          <Link to="/products" className="px-3 py-1.5 text-sm font-medium hover:text-primary [&.active]:text-primary">
            {t("nav.products")}
          </Link>
          <span className="w-px h-4 bg-border mx-1 hidden sm:inline-block" />
          {categories.slice(0, 8).map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ cat: c.id, q: undefined } as never}
              className="px-3 py-1.5 text-sm hover:text-primary transition"
            >
              <span className="mr-1">{c.icon}</span>
              {c.name[lang]}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
