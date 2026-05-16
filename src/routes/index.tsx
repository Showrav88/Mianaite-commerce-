import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, HeadphonesIcon, Flame, Star } from "lucide-react";
import heroImg from "@/assets/hero-banner.jpg";
import promoElec from "@/assets/promo-electronics.jpg";
import promoFashion from "@/assets/promo-fashion.jpg";
import { useI18n } from "@/lib/i18n";
import { categories, flashSaleProducts, bestSellers, newArrivals } from "@/lib/products";
import { ProductCard } from "@/components/storefront/ProductCard";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "TrendMart — Shop Smarter, Save Bigger" },
      { name: "description", content: "Bangladesh's friendly online marketplace. Electronics, fashion, groceries and more with cash on delivery." },
    ],
  }),
});

function Home() {
  const { t, lang } = useI18n();
  const flash = flashSaleProducts();
  const best = bestSellers();
  const fresh = newArrivals();

  return (
    <div>
      {/* Hero */}
      <section className="bg-[image:var(--gradient-hero)]">
        <div className="container mx-auto px-4 py-10 md:py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium mb-4">
              🇧🇩 {t("hero.tag")}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] whitespace-pre-line">
              {t("hero.title").split("\n").map((line, i) => (
                <span key={i} className={i === 1 ? "block text-primary" : "block"}>{line}</span>
              ))}
            </h1>
            <p className="mt-5 text-muted-foreground text-lg max-w-lg">{t("hero.desc")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 shadow-[var(--shadow-hover)]">
                {t("hero.cta")} <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#categories" className="inline-flex items-center gap-2 bg-background border px-6 py-3 rounded-full font-medium hover:bg-secondary">
                {t("hero.cta2")}
              </a>
            </div>
          </div>
          <div className="relative">
            <img src={heroImg} alt="Shopping at TrendMart" width={1600} height={800} className="rounded-2xl shadow-[var(--shadow-hover)] aspect-[4/3] object-cover" />
            <div className="absolute -bottom-4 -left-4 bg-card border rounded-xl px-4 py-3 shadow-[var(--shadow-card)] flex items-center gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-lg"><Truck className="w-5 h-5" /></div>
              <div className="text-xs"><div className="font-semibold">{lang === "en" ? "Free Delivery" : "ফ্রি ডেলিভারি"}</div><div className="text-muted-foreground">{lang === "en" ? "Over ৳1500" : "৳১৫০০ এর বেশি"}</div></div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="border-t bg-background/50">
          <div className="container mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Trust icon={<Truck className="w-5 h-5" />} title={lang === "en" ? "Fast Delivery" : "দ্রুত ডেলিভারি"} desc={lang === "en" ? "Nationwide 2-3 days" : "সারাদেশে ২-৩ দিন"} />
            <Trust icon={<ShieldCheck className="w-5 h-5" />} title={lang === "en" ? "Genuine Products" : "অরিজিনাল পণ্য"} desc={lang === "en" ? "100% authentic" : "১০০% অথেন্টিক"} />
            <Trust icon={<RotateCcw className="w-5 h-5" />} title={lang === "en" ? "Easy Returns" : "সহজ রিটার্ন"} desc={lang === "en" ? "7-day return policy" : "৭ দিনের রিটার্ন"} />
            <Trust icon={<HeadphonesIcon className="w-5 h-5" />} title={lang === "en" ? "24/7 Support" : "২৪/৭ সাপোর্ট"} desc={lang === "en" ? "We're here to help" : "যেকোনো সাহায্যে"} />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="container mx-auto px-4 py-14">
        <SectionTitle title={t("section.categories")} />
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ cat: c.id, q: undefined } as never}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary hover:bg-accent transition"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-background grid place-items-center text-3xl group-hover:scale-110 transition shadow-[var(--shadow-card)]">
                {c.icon}
              </div>
              <span className="text-xs md:text-sm font-medium text-center">{c.name[lang]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo banners */}
      <section className="container mx-auto px-4 grid md:grid-cols-2 gap-4">
        <div className="relative rounded-2xl overflow-hidden aspect-[2/1]">
          <img src={promoElec} alt="Electronics sale" loading="lazy" className="w-full h-full object-cover" />
        </div>
        <div className="relative rounded-2xl overflow-hidden aspect-[2/1]">
          <img src={promoFashion} alt="Fashion collection" loading="lazy" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Flash sale */}
      {flash.length > 0 && (
        <section className="container mx-auto px-4 py-14">
          <div className="bg-gradient-to-r from-primary/10 to-destructive/10 rounded-2xl p-5 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-destructive text-destructive-foreground p-2 rounded-lg"><Flame className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{t("section.flash")}</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">{t("section.flash.desc")}</p>
                </div>
              </div>
              <Link to="/products" className="text-sm font-medium text-primary hover:underline">{t("card.viewAll")} →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {flash.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      <section className="container mx-auto px-4 py-6">
        <SectionTitle title={t("section.featured")} action={<Link to="/products" className="text-sm font-medium text-primary hover:underline">{t("card.viewAll")} →</Link>} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {best.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* New arrivals */}
      <section className="container mx-auto px-4 py-14">
        <SectionTitle title={t("section.new")} action={<Link to="/products" className="text-sm font-medium text-primary hover:underline">{t("card.viewAll")} →</Link>} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {fresh.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-secondary py-14">
        <div className="container mx-auto px-4">
          <SectionTitle title={t("section.reviews")} />
          <div className="grid md:grid-cols-3 gap-5">
            {reviews(lang).map((r, i) => (
              <div key={i} className="bg-card p-6 rounded-2xl shadow-[var(--shadow-card)]">
                <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-sm leading-relaxed mb-4">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold">{r.name[0]}</div>
                  <div>
                    <div className="font-medium text-sm">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Trust({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 text-primary p-2 rounded-lg shrink-0">{icon}</div>
      <div><div className="font-semibold text-sm">{title}</div><div className="text-xs text-muted-foreground">{desc}</div></div>
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
      {action}
    </div>
  );
}

function reviews(lang: "en" | "bn") {
  return lang === "en"
    ? [
        { name: "Rahim Ahmed", city: "Dhaka", text: "Fast delivery and the product was exactly as shown. Will order again!" },
        { name: "Nusrat Jahan", city: "Chittagong", text: "Great prices and easy checkout — no signup hassle. Loved the experience." },
        { name: "Tanvir Hossain", city: "Sylhet", text: "Customer support helped me track my order quickly. Highly recommended." },
      ]
    : [
        { name: "রহিম আহমেদ", city: "ঢাকা", text: "দ্রুত ডেলিভারি, পণ্যটি যেমন দেখানো ছিল ঠিক তেমনই পেয়েছি। আবার অর্ডার করব!" },
        { name: "নুসরাত জাহান", city: "চট্টগ্রাম", text: "চমৎকার দাম আর সহজ চেকআউট — সাইনআপের ঝামেলা নেই। অভিজ্ঞতা দারুণ।" },
        { name: "তানভীর হোসেন", city: "সিলেট", text: "কাস্টমার সাপোর্ট আমাকে দ্রুত অর্ডার ট্র্যাক করতে সাহায্য করেছে। হাইলি রেকমেন্ডেড।" },
      ];
}
