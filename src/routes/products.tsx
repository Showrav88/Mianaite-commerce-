import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SlidersHorizontal } from "lucide-react";
import { products, categories } from "@/lib/products";
import { ProductCard } from "@/components/storefront/ProductCard";
import { useI18n } from "@/lib/i18n";

const searchSchema = z.object({
  cat: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "All Products — AITeShops" },
      { name: "description", content: "Browse all products at AITeShops. Filter by category, price, and more." },
    ],
  }),
});

type Sort = "popular" | "priceAsc" | "priceDesc" | "new";

function ProductsPage() {
  const { cat, q } = Route.useSearch();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [sort, setSort] = useState<Sort>("popular");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let r = products.slice();
    if (cat) r = r.filter((p) => p.category === cat);
    if (q) {
      const ql = q.toLowerCase();
      r = r.filter((p) => p.name.en.toLowerCase().includes(ql) || p.name.bn.includes(q) || p.brand.toLowerCase().includes(ql));
    }
    r = r.filter((p) => p.price <= maxPrice);
    if (sort === "priceAsc") r.sort((a, b) => a.price - b.price);
    else if (sort === "priceDesc") r.sort((a, b) => b.price - a.price);
    else if (sort === "new") r.sort((a, b) => Number(b.tags?.includes("new") ?? 0) - Number(a.tags?.includes("new") ?? 0));
    else r.sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
    return r;
  }, [cat, q, sort, maxPrice]);

  const currentCat = categories.find((c) => c.id === cat);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {currentCat ? currentCat.name[lang] : q ? `"${q}"` : t("nav.products")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filtered.length} {lang === "en" ? "products" : "টি পণ্য"}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters */}
        <aside className={`md:w-64 shrink-0 ${showFilters ? "block" : "hidden md:block"}`}>
          <div className="bg-card border rounded-xl p-5 sticky top-32">
            <h3 className="font-semibold mb-4">{t("filters.title")}</h3>

            <div className="mb-5">
              <h4 className="text-sm font-medium mb-2">{t("filters.category")}</h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => navigate({ to: "/products", search: { cat: undefined, q } as never })}
                  className={`block w-full text-left text-sm px-2 py-1.5 rounded ${!cat ? "bg-accent text-accent-foreground font-medium" : "hover:bg-secondary"}`}
                >
                  {t("filters.all")}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate({ to: "/products", search: { cat: c.id, q } as never })}
                    className={`block w-full text-left text-sm px-2 py-1.5 rounded ${cat === c.id ? "bg-accent text-accent-foreground font-medium" : "hover:bg-secondary"}`}
                  >
                    <span className="mr-1.5">{c.icon}</span>{c.name[lang]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">{t("filters.price")}</h4>
              <input type="range" min={100} max={10000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-[var(--color-primary)]" />
              <div className="text-xs text-muted-foreground mt-1">≤ ৳{maxPrice.toLocaleString()}</div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <button className="md:hidden inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-4 h-4" /> {t("filters.title")}
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-muted-foreground">{t("sort.label")}:</label>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary">
                <option value="popular">{t("sort.popular")}</option>
                <option value="priceAsc">{t("sort.priceAsc")}</option>
                <option value="priceDesc">{t("sort.priceDesc")}</option>
                <option value="new">{t("sort.new")}</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {lang === "en" ? "No products match your filters." : "আপনার ফিল্টারের সাথে মিলে এমন কোনো পণ্য নেই।"}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
