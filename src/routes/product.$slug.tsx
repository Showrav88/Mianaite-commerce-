import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, Zap, Share2, Star, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { findProduct, products, discountPercent } from "@/lib/products";
import { useI18n, formatBDT } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/storefront/ProductCard";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const p = findProduct(params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name.en} — AITeShops` },
          { name: "description", content: loaderData.description.en.slice(0, 155) },
          { property: "og:title", content: `${loaderData.name.en} — AITeShops` },
          { property: "og:description", content: loaderData.description.en.slice(0, 155) },
          { property: "og:image", content: loaderData.images[0] },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <Link to="/products" className="text-primary hover:underline mt-4 inline-block">Browse all products</Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="container mx-auto px-4 py-20 text-center text-destructive">{error.message}</div>,
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const { t, lang } = useI18n();
  const { add } = useCart();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const disc = discountPercent(product);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const buyNow = () => { add(product.id, qty); navigate({ to: "/checkout" }); };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/" className="hover:text-primary">{t("nav.home")}</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary">{t("nav.products")}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name[lang]}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="aspect-square bg-secondary rounded-2xl overflow-hidden">
            <img src={product.images[activeImg]} alt={product.name[lang]} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${activeImg === i ? "border-primary" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 text-xs mb-2">
            <span className="text-muted-foreground">{product.brand}</span>
            {product.tags?.includes("bestseller") && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">{t("badge.bestseller")}</span>}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name[lang]}</h1>

          <div className="flex items-center gap-3 mt-3 text-sm">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{product.rating}</span>
            </span>
            <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{t("pd.sku")}: {product.sku}</span>
          </div>

          <div className="mt-5 bg-secondary rounded-xl p-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatBDT(product.price, lang)}</span>
              {product.retailPrice > product.price && (
                <>
                  <span className="text-base text-muted-foreground line-through">{formatBDT(product.retailPrice, lang)}</span>
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">-{disc}% {t("common.off")}</span>
                </>
              )}
            </div>
            <div className="mt-2 text-sm">
              {product.stock > 10 ? <span className="text-success">● {t("stock.in")} ({product.stock})</span>
                : product.stock > 0 ? <span className="text-amber-600">● {t("stock.low", { n: product.stock })}</span>
                : <span className="text-destructive">● {t("stock.out")}</span>}
            </div>
          </div>

          {/* Qty + actions */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm font-medium">{t("pd.qty")}:</span>
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-secondary"><Minus className="w-4 h-4" /></button>
              <span className="w-12 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-2 hover:bg-secondary"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              disabled={product.stock <= 0}
              onClick={() => add(product.id, qty)}
              className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary hover:text-primary-foreground transition disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />{t("card.add")}
            </button>
            <button
              disabled={product.stock <= 0}
              onClick={buyNow}
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 shadow-[var(--shadow-hover)]"
            >
              <Zap className="w-4 h-4" />{t("pd.buy")}
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg"><Truck className="w-4 h-4 text-primary shrink-0" />{lang === "en" ? "Fast delivery" : "দ্রুত ডেলিভারি"}</div>
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg"><RotateCcw className="w-4 h-4 text-primary shrink-0" />{lang === "en" ? "7-day return" : "৭ দিন রিটার্ন"}</div>
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg"><ShieldCheck className="w-4 h-4 text-primary shrink-0" />{lang === "en" ? "Authentic" : "অরিজিনাল"}</div>
          </div>

          <button className="mt-5 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><Share2 className="w-4 h-4" />{t("pd.share")}</button>
        </div>
      </div>

      {/* Description + specs */}
      <div className="mt-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-3">{t("pd.desc")}</h2>
          <p className="text-muted-foreground leading-relaxed">{product.description[lang]}</p>
        </div>
        {product.specs && (
          <div>
            <h2 className="text-xl font-bold mb-3">{t("pd.specs")}</h2>
            <dl className="divide-y border rounded-lg">
              {product.specs.map((s: { en: string; bn: string; value: string }, i: number) => (
                <div key={i} className="flex justify-between py-2.5 px-3 text-sm">
                  <dt className="text-muted-foreground">{s[lang === "en" ? "en" : "bn"]}</dt>
                  <dd className="font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-5">{t("pd.related")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
