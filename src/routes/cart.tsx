import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useI18n, formatBDT } from "@/lib/i18n";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Your Cart — AITeShops" }] }),
});

function CartPage() {
  const { detailedItems, subtotal, setQty, remove } = useCart();
  const { t, lang } = useI18n();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "TREND10") setDiscount(Math.round(subtotal * 0.1));
    else if (coupon.toUpperCase() === "WELCOME") setDiscount(100);
    else setDiscount(0);
  };

  const shipping = subtotal === 0 ? 0 : subtotal >= 1500 ? 0 : 60;
  const total = Math.max(0, subtotal - discount + shipping);

  if (detailedItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-secondary grid place-items-center mb-5">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">{t("cart.empty")}</h1>
        <Link to="/products" className="mt-6 inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90">
          {t("cart.continue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("cart.title")}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {detailedItems.map((item) => (
            <div key={item.productId} className="bg-card border rounded-xl p-4 flex gap-4">
              <Link to="/product/$slug" params={{ slug: item.product.slug }} className="w-24 h-24 shrink-0 bg-secondary rounded-lg overflow-hidden">
                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to="/product/$slug" params={{ slug: item.product.slug }} className="font-medium hover:text-primary line-clamp-2">
                  {item.product.name[lang]}
                </Link>
                <div className="text-xs text-muted-foreground mt-1">{item.product.brand}</div>
                <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => setQty(item.productId, item.qty - 1)} className="p-1.5 hover:bg-secondary"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-10 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => setQty(item.productId, item.qty + 1)} className="p-1.5 hover:bg-secondary"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">{formatBDT(item.product.price * item.qty, lang)}</span>
                    <button onClick={() => remove(item.productId)} aria-label={t("cart.remove")} className="p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-card border rounded-xl p-5 h-fit sticky top-32">
          <h2 className="font-bold text-lg mb-4">{lang === "en" ? "Order Summary" : "অর্ডার সারাংশ"}</h2>

          <div className="flex gap-2 mb-4">
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder={t("cart.coupon")} className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary" />
            <button onClick={applyCoupon} className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium hover:bg-accent">{t("cart.apply")}</button>
          </div>
          {discount > 0 && <p className="text-xs text-success mb-3">✓ {lang === "en" ? "Coupon applied" : "কুপন প্রয়োগ হয়েছে"}</p>}
          {coupon === "" && <p className="text-xs text-muted-foreground mb-3">Try <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">TREND10</span> or <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">WELCOME</span></p>}

          <div className="space-y-2 text-sm border-t pt-4">
            <Row label={t("cart.subtotal")} value={formatBDT(subtotal, lang)} />
            {discount > 0 && <Row label={lang === "en" ? "Discount" : "ছাড়"} value={`-${formatBDT(discount, lang)}`} className="text-success" />}
            <Row label={t("cart.shipping")} value={shipping === 0 ? t("cart.free") : formatBDT(shipping, lang)} />
            <div className="border-t pt-3 mt-2 flex justify-between font-bold text-lg">
              <span>{t("cart.total")}</span>
              <span className="text-primary">{formatBDT(total, lang)}</span>
            </div>
          </div>

          <Link to="/checkout" className="mt-5 block text-center bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 shadow-[var(--shadow-hover)]">
            {t("cart.checkout")}
          </Link>
          <Link to="/products" className="mt-2 block text-center text-sm text-muted-foreground hover:text-primary">
            {t("cart.continue")}
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
