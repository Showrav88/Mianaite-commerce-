import { createFileRoute, Link } from "@tanstack/react-router";
import { redirectToLogin } from '@/lib/office-only';
import { CheckCircle2, Package } from "lucide-react";
import { z } from "zod";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/order-success")({
  beforeLoad: () => redirectToLogin(),
  validateSearch: z.object({ id: z.string().optional() }),
  component: SuccessPage,
  head: () => ({ meta: [{ title: "Order Placed — AITeShops" }, { name: "robots", content: "noindex" }] }),
});

function SuccessPage() {
  const { id } = Route.useSearch();
  const { t, lang } = useI18n();

  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-success/10 grid place-items-center mb-5">
        <CheckCircle2 className="w-12 h-12 text-success" />
      </div>
      <h1 className="text-3xl font-bold">{t("success.title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("success.desc")}</p>

      {id && (
        <div className="mt-6 inline-flex items-center gap-2 bg-secondary px-5 py-3 rounded-lg">
          <Package className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">{t("success.id")}:</span>
          <span className="font-mono font-bold">{id}</span>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90">{t("success.home")}</Link>
        <Link to="/products" className="border px-6 py-3 rounded-full font-medium hover:bg-secondary">{lang === "en" ? "Keep shopping" : "আরও কেনাকাটা"}</Link>
      </div>
    </div>
  );
}
