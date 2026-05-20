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

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Go home
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
          <a href="/" className="rounded-md border px-4 py-2 text-sm font-medium">Go home</a>
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
      { title: "AITeShops — Bangladesh's Everyday Online Marketplace" },
      { name: "description", content: "Shop electronics, fashion, groceries, beauty and more at AITeShops. Cash on delivery across Bangladesh." },
      { property: "og:title", content: "AITeShops — Bangladesh's Everyday Online Marketplace" },
      { property: "og:description", content: "Shop electronics, fashion, groceries, beauty and more. Cash on delivery across Bangladesh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap" },
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
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/superadmin') || pathname === '/login' || pathname.startsWith('/shop/');
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminStoreProvider>
          <CustomerStoreProvider>
            <ShopCartProvider>
          <I18nProvider>
            <CartProvider>
              {isAdminPath ? (
                <Outlet />
              ) : (
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1"><Outlet /></main>
                  <Footer />
                </div>
              )}
            </CartProvider>
          </I18nProvider>
            </ShopCartProvider>
          </CustomerStoreProvider>
        </AdminStoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
