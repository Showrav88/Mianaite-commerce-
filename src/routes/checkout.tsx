import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { redirectToLogin } from '@/lib/office-only';
import { useState } from "react";
import { z } from "zod";
import { Banknote, Lock } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n, formatBDT } from "@/lib/i18n";

export const Route = createFileRoute("/checkout")({
  beforeLoad: () => redirectToLogin(),
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — AITeShops" }] }),
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  phone: z.string().trim().regex(/^(\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number"),
  address: z.string().trim().min(10, "Please provide a complete address").max(500),
  note: z.string().max(500).optional(),
});

function CheckoutPage() {
  const { detailedItems, subtotal, clear } = useCart();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const shipping = subtotal === 0 ? 0 : subtotal >= 1500 ? 0 : 60;
  const total = subtotal + shipping;

  if (detailedItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">{t("cart.empty")}</h1>
        <Link to="/products" className="mt-6 inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium">{t("cart.continue")}</Link>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setTimeout(() => {
      const orderId = "TM" + Date.now().toString().slice(-8);
      clear();
      navigate({ to: "/order-success", search: { id: orderId } as never });
    }, 700);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">{t("co.title")}</h1>

      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <section className="bg-card border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">{t("co.contact")}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("co.name")} error={errors.name}>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg outline-none focus:border-primary" />
              </Field>
              <Field label={t("co.phone")} error={errors.phone}>
                <input type="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg outline-none focus:border-primary" />
              </Field>
              <Field label={t("co.address")} error={errors.address} className="sm:col-span-2">
                <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg outline-none focus:border-primary resize-none" />
              </Field>
              <Field label={t("co.note")} className="sm:col-span-2">
                <textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg outline-none focus:border-primary resize-none" />
              </Field>
            </div>
          </section>

          {/* Payment */}
          <section className="bg-card border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">{t("co.payment")}</h2>
            <label className="flex items-start gap-3 p-4 border-2 border-primary rounded-lg bg-primary/5 cursor-pointer">
              <input type="radio" checked readOnly className="mt-1 accent-[var(--color-primary)]" />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium">
                  <Banknote className="w-5 h-5 text-primary" />{t("co.cod")}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t("co.cod.desc")}</p>
              </div>
            </label>
          </section>
        </div>

        {/* Summary */}
        <aside className="bg-card border rounded-xl p-5 h-fit sticky top-32">
          <h2 className="font-bold text-lg mb-4">{t("co.summary")}</h2>
          <div className="space-y-3 max-h-64 overflow-auto pr-1">
            {detailedItems.map((it) => (
              <div key={it.productId} className="flex gap-3 text-sm">
                <div className="w-14 h-14 rounded bg-secondary overflow-hidden shrink-0 relative">
                  <img src={it.product.images[0]} alt="" className="w-full h-full object-cover" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 grid place-items-center">{it.qty}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="line-clamp-2 text-xs">{it.product.name[lang]}</div>
                  <div className="text-primary font-semibold mt-0.5">{formatBDT(it.product.price * it.qty, lang)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.subtotal")}</span><span className="font-medium">{formatBDT(subtotal, lang)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.shipping")}</span><span className="font-medium">{shipping === 0 ? t("cart.free") : formatBDT(shipping, lang)}</span></div>
            <div className="flex justify-between border-t pt-3 mt-2 font-bold text-lg">
              <span>{t("cart.total")}</span><span className="text-primary">{formatBDT(total, lang)}</span>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="mt-5 w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-60 shadow-[var(--shadow-hover)]">
            {submitting ? (lang === "en" ? "Placing order…" : "অর্ডার করা হচ্ছে…") : t("co.place")}
          </button>
          <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5 justify-center"><Lock className="w-3 h-3" />{lang === "en" ? "Your details are safe with us" : "আপনার তথ্য নিরাপদ"}</p>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium block mb-1.5">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive mt-1 block">{error}</span>}
    </label>
  );
}
