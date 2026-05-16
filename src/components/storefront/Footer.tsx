import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t, lang } = useI18n();
  return (
    <footer className="bg-secondary mt-20 border-t">
      <div className="container mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center text-primary-foreground font-bold">T</div>
            <span className="font-bold text-xl">TrendMart</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{t("footer.aboutDesc")}</p>
          <div className="flex gap-2 mt-4">
            <a href="#" aria-label="Facebook" className="w-9 h-9 grid place-items-center rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition"><Facebook className="w-4 h-4" /></a>
            <a href="#" aria-label="Instagram" className="w-9 h-9 grid place-items-center rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="YouTube" className="w-9 h-9 grid place-items-center rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition"><Youtube className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">{t("footer.shop")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-primary">{t("nav.products")}</Link></li>
            <li><Link to="/products" search={{ cat: "electronics", q: undefined } as never} className="hover:text-primary">{lang === "en" ? "Electronics" : "ইলেকট্রনিক্স"}</Link></li>
            <li><Link to="/products" search={{ cat: "fashion", q: undefined } as never} className="hover:text-primary">{lang === "en" ? "Fashion" : "ফ্যাশন"}</Link></li>
            <li><Link to="/products" search={{ cat: "groceries", q: undefined } as never} className="hover:text-primary">{lang === "en" ? "Groceries" : "গ্রোসারি"}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">{t("footer.help")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-primary">{t("footer.contact")}</a></li>
            <li><a href="#" className="hover:text-primary">{t("footer.faq")}</a></li>
            <li><a href="#" className="hover:text-primary">{t("footer.returns")}</a></li>
            <li><a href="#" className="hover:text-primary">{t("footer.privacy")}</a></li>
            <li><a href="#" className="hover:text-primary">{t("footer.terms")}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">{t("footer.newsletter")}</h4>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" required placeholder="you@example.com" className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border text-sm outline-none focus:border-primary" />
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">{t("footer.subscribe")}</button>
          </form>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} TrendMart. {t("footer.rights")}</span>
          <span>Made with ❤️ in Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}
