import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { AdminStoreProvider } from "@/lib/admin-store";
import { CustomerStoreProvider } from "@/lib/customer-store";
import { ShopCartProvider } from "@/lib/shop-cart";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { MarketStoreProvider } from "@/lib/market-store";
import { OfficeStoreProvider } from "@/lib/office-store";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/login" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing or head home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Try again</button>
          <a href="/login" className="rounded-md border px-4 py-2 text-sm font-medium">Login</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "1to99 — Inventory & POS" },
      { name: "description", content: "1to99 back-office: inventory, counter POS, wallet, staff, and reports." },
      { property: "og:title", content: "AITeShops — Bangladesh's Everyday Online Marketplace" },
      { property: "og:description", content: "Shop electronics, fashion, groceries, beauty and more. Cash on delivery across Bangladesh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#e8621a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "AITeShops" },
      { name: "msapplication-TileColor", content: "#e8621a" },
      { name: "msapplication-TileImage", content: "/shops/ait-logo.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/shops/ait-logo.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}` }} />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const isOfficePath =
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname.startsWith('/counter');
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminStoreProvider>
          <MarketStoreProvider>
          <OfficeStoreProvider>
          <CustomerStoreProvider>
            <ShopCartProvider>
          <I18nProvider>
            <CartProvider>
              {isOfficePath ? (
                <Outlet />
              ) : (
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1"><Outlet /></main>
                  <Footer />
                </div>
              )}
              <Toaster richColors position="top-right" />
            </CartProvider>
          </I18nProvider>
            </ShopCartProvider>
          </CustomerStoreProvider>
          </OfficeStoreProvider>
          </MarketStoreProvider>
        </AdminStoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
