# DESIGN_NOTES.md — 1to99 Market Frontend Demo

> Every new file MUST follow these conventions. Read before writing any feature code.

---

## 1. Routing Architecture

**Router:** TanStack Router v1 (file-based, Vite plugin auto-generates `src/routeTree.gen.ts`)  
**Config:** `src/router.tsx` creates the router with `{ queryClient }` context  
**Root:** `src/routes/__root.tsx` — `createRootRouteWithContext<{ queryClient: QueryClient }>()`

### File → Path mapping
| File | Route path |
|---|---|
| `routes/index.tsx` | `/` |
| `routes/admin.tsx` | `/admin` (layout with sidebar) |
| `routes/admin/index.tsx` | `/admin/` |
| `routes/admin/products.tsx` | `/admin/products` |
| `routes/admin/catalog/products.tsx` | `/admin/catalog/products` |
| `routes/admin/catalog/products_.$id.tsx` | `/admin/catalog/products/$id` (not nested in products layout) |
| `routes/counter.tsx` | `/counter` (full-screen layout) |
| `routes/counter/index.tsx` | `/counter/` |
| `routes/shop.$slug.tsx` | `/shop/:slug` (layout) |
| `routes/shop.$slug/deals.tsx` | `/shop/:slug/deals` |

**Key conventions:**
- `$param` in filename = `:param` in URL
- `_` suffix on segment = non-layout parent (no nesting): `products_.$id.tsx` → child of admin, not of `products.tsx`
- Layout files (e.g., `admin.tsx`) render `<Outlet />` for children in same-name directory
- `createFileRoute('/exact/path')` — path string must match the file convention

### Navigation patterns
```tsx
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
<Link to="/admin/catalog/products" search={{ cat: 'watches' }}>...</Link>
const navigate = useNavigate()
navigate({ to: '/admin/catalog/products/$id', params: { id: 'new' } })
const pathname = useRouterState({ select: s => s.location.pathname })
```

### Loaders & search params
```tsx
export const Route = createFileRoute('/admin/catalog/products')({
  validateSearch: z.object({ cat: z.string().optional(), q: z.string().optional() }),
  loader: async ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(productsQueryOptions()),
  component: ProductsPage,
})
// In component:
const { cat, q } = Route.useSearch()
const products = Route.useLoaderData()
```

---

## 2. Theme Tokens

**File:** `src/styles.css` — Tailwind v4 with `@theme inline`  
**Color space:** OKLch (perceptually uniform)

### Key tokens (CSS variables)
| Token | Light value | Purpose |
|---|---|---|
| `--primary` | `oklch(0.68 0.20 42)` | Brand orange (Daraz-style) |
| `--primary-foreground` | `oklch(1 0 0)` | White text on primary |
| `--secondary` | `oklch(0.96 0.005 50)` | Light gray surface |
| `--muted` | `oklch(0.97 0.003 50)` | Ultra-light surface |
| `--muted-foreground` | `oklch(0.48 0.01 50)` | Subdued text |
| `--accent` | `oklch(0.95 0.04 50)` | Warm neutral |
| `--destructive` | `oklch(0.58 0.22 27)` | Error red |
| `--success` | `oklch(0.62 0.16 145)` | Success green |
| `--border` | `oklch(0.92 0.005 50)` | Subtle borders |
| `--ring` | `oklch(0.68 0.20 42)` | Focus ring = primary |
| `--radius` | `0.625rem` | Base radius |

**Tailwind class equivalents:** `bg-primary`, `text-primary-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`, `ring-ring`, `bg-destructive`, `text-success`

### Dark mode
`@custom-variant dark (&:is(.dark *))` — class-based: add `class="dark"` to `<html>`.  
Dark mode tokens **not yet defined** in styles.css — use Tailwind dark: variant for new components.

### Fonts
```
--font-sans: "Inter", "Hind Siliguri", system-ui, sans-serif
--font-bn: "Hind Siliguri", "Inter", system-ui, sans-serif
```

### Custom shadows/gradients
```
shadow-card   — var(--shadow-card)   subtle elevation
shadow-hover  — var(--shadow-hover)  hover lift effect
gradient-primary — linear-gradient orange
```

---

## 3. Component Inventory

All UI primitives live in `src/components/ui/`. **Never roll a custom replacement — use `npx shadcn add <name>` if missing.**

### Available primitives (46 total)
`accordion` · `alert-dialog` · `alert` · `aspect-ratio` · `avatar` · `badge` · `breadcrumb` · `button` · `calendar` · `carousel` (embla) · `chart` (recharts) · `checkbox` · `collapsible` · `command` · `context-menu` · `dialog` · `drawer` (vaul) · `dropdown-menu` · `form` · `hover-card` · `input-otp` · `input` · `label` · `menubar` · `navigation-menu` · `pagination` · `popover` · `progress` · `radio-group` · `resizable` · `scroll-area` · `select` · `separator` · `sheet` (vaul) · `sidebar` · `skeleton` · `slider` · `sonner` · `switch` · `table` · `tabs` · `textarea` · `toggle-group` · `toggle` · `tooltip`

### Utility
```tsx
// src/lib/utils.ts
import { cn } from '@/lib/utils' // twMerge(clsx(...inputs))
```

### Layout shells
- `src/components/storefront/Header.tsx` — public site header
- `src/components/storefront/Footer.tsx` — public site footer
- `src/components/storefront/ProductCard.tsx` — reusable product card
- `src/routes/admin.tsx` — admin layout with collapsible sidebar
- `src/routes/superadmin.tsx` — superadmin layout
- `src/routes/counter.tsx` — **new** full-screen POS layout (no sidebar)

---

## 4. Data & Forms

### QueryClient
Injected into all routes via context: `const { queryClient } = Route.useRouteContext()`  
Wrap mock fetchers to return after 150 ms so loading states are demoable.

```tsx
// Pattern
const mockFetch = <T,>(data: T, ms = 150): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), ms))

const productsQueryOptions = () => queryOptions({
  queryKey: ['market', 'products'],
  queryFn: () => mockFetch(MARKET_PRODUCTS),
})
```

### Context providers (in `__root.tsx` provider stack, outer→inner)
1. `QueryClientProvider`
2. `AuthProvider` — `useAuth()` → `{ user, login, logout }`
3. `AdminStoreProvider` — `useAdminStore()` → shops, orders, products (existing AITeShops data)
4. `MarketStoreProvider` — **new** → `useMarketStore()` → returns, deals, counter shifts
5. `CustomerStoreProvider`
6. `ShopCartProvider`
7. `I18nProvider` — `useI18n()` → `{ t, lang, setLang }`
8. `CartProvider`

### Form pattern
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
```

### Toasts
```tsx
import { toast } from 'sonner'
toast.success('Saved!') // or toast.error(), toast.loading(), toast.promise()
```
`<Toaster />` is mounted in `__root.tsx` (added as part of this build).

### Persistence
New 1to99 data persists to localStorage keys:
- `market_returns_v1` — returns queue
- `market_deals_v1` — active deals
- `market_counter_v1` — current counter session

---

## 5. Conventions

### Import alias
`@/` = `src/` (configured in `tsconfig.json` and Vite)

### File naming
| Type | Convention | Example |
|---|---|---|
| Route files | TanStack convention (kebab + `$` + `_`) | `products_.$id.tsx` |
| Component files | PascalCase | `VariantMatrix.tsx` |
| Utility/lib files | kebab-case | `market-store.tsx` |
| UI primitives | kebab-case | `button.tsx` |

### Type imports
Use `type` keyword for type-only imports: `import type { MarketProduct } from '@/mock/products'`

### Mock data location
`src/mock/` — all 1to99 Market seed data. Do NOT modify `src/lib/products.ts` or `src/lib/admin-store.tsx`.

### BDT currency formatting
```tsx
const fmt = (n: number) => `৳${n.toLocaleString('en-BD')}`
```

### No comments rule
Only add a comment when the WHY is non-obvious. No docstrings, no narrating what code does.

---

## 6. Design Direction per Surface

| Surface | Vibe | Density | Key pattern |
|---|---|---|---|
| `/superadmin` | Linear/Stripe — professional | Dense | Stat tables, data grids |
| `/admin` | Same — dashboard | Dense | Sidebar nav, cards, charts |
| `/counter` | Square POS — touch-friendly | Large hit areas (≥44px) | Full-screen, minimal chrome |
| `/shop/:slug` | Modern retail — warm | Generous whitespace | Photo-driven, mobile-first |

All four surfaces share the same Tailwind tokens. Differentiate by **density and layout**, not color.

### Shared rules
- Icons: Lucide React only, consistent `w-4 h-4` stroke
- Empty states: icon + heading + helper text + primary CTA
- Loading: `<Skeleton />` from shadcn, never spinners
- Dark mode: must work everywhere — use `dark:` Tailwind variant
- Prices: always `৳` prefix, `toLocaleString('en-BD')`
