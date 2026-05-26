import { createFileRoute, Link } from '@tanstack/react-router'
import { ShieldCheck, LayoutDashboard, ScanLine, ShoppingBag, ArrowRight, Store } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: PersonaSwitcher,
  head: () => ({ meta: [{ title: '1to99 Market — Demo Entry' }] }),
})

interface Persona {
  role: string
  to: string
  search?: Record<string, string>
  icon: React.ElementType
  color: string
  bg: string
  border: string
  headline: string
  description: string
  bullets: readonly string[]
}

const PERSONAS: Persona[] = [
  {
    role: '1to99 Market',
    to: '/login',
    search: { redirect: '/admin' },
    icon: Store,
    color: '#f97316',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    headline: '1to99 Market Admin',
    description: 'Manage the 1to99 Market shop — all categories, multi-category catalog, counter POS, orders & returns.',
    bullets: ['Multi-category catalog', 'Counter POS access', 'Orders & inventory', 'Returns & label builder'],
  },
  {
    role: 'Platform Admin',
    to: '/login',
    search: { redirect: '/superadmin' },
    icon: ShieldCheck,
    color: '#6366f1',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-800',
    headline: 'Platform Control',
    description: 'Grant category access to vendor shops, approve new shops, and monitor platform-wide analytics.',
    bullets: ['All vendor shops & admins', 'Category permission grants', 'Platform KPIs', 'Shop approvals'],
  },
  {
    role: 'Vendor Admin',
    to: '/login',
    search: { redirect: '/admin' },
    icon: LayoutDashboard,
    color: '#ec4899',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    border: 'border-pink-200 dark:border-pink-800',
    headline: 'Your Shop Back-office',
    description: 'Individual vendor admin — manage your own catalog, variants, returns, labels and orders.',
    bullets: ['Products & variant matrix', 'Returns → Deals pipeline', 'Label builder', 'Orders & inventory'],
  },
  {
    role: 'Counter Staff',
    to: '/counter',
    icon: ScanLine,
    color: '#059669',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    headline: 'POS Terminal',
    description: 'Touch-optimised point-of-sale screen. Scan or search products, take payment across bKash/cash/card/split.',
    bullets: ['Scan or keyword search', 'Cash / Card / bKash / Nagad / Split', 'Thermal receipt preview', 'Shift report'],
  },
  {
    role: 'Customer',
    to: '/shop/1to99-market-dhaka-mirpur-tw3k9p',
    icon: ShoppingBag,
    color: '#db2777',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    border: 'border-pink-200 dark:border-pink-800',
    headline: 'Mirpur Storefront',
    description: 'Browse the full retail experience — categories, variant picker, deals channel, cart and guest checkout.',
    bullets: ['Category & product browse', 'Variant swatches', "Today's Deals channel", 'Cart & checkout'],
  },
]

function PersonaSwitcher() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight text-foreground">1to99 Market</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Frontend Demo</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground border rounded-full px-3 py-1.5 bg-background">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          TanStack Start · shadcn/ui · Tailwind v4
        </span>
      </header>

      <div className="text-center px-6 pt-8 pb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Choose your perspective</h1>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          Four surfaces, one product. All running on mock data with localStorage persistence.
        </p>
      </div>

      <main className="flex-1 px-4 pb-16 max-w-6xl mx-auto w-full">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERSONAS.map(p => (
            <Link
              key={p.role}
              to={p.to as any}
              search={p.search as any}
              className={`group flex flex-col rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${p.bg} ${p.border}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}>
                  <p.icon className="w-5 h-5" style={{ color: p.color }} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full text-white" style={{ backgroundColor: p.color }}>
                  {p.role}
                </span>
              </div>

              <h2 className="font-bold text-base text-foreground mb-1.5">{p.headline}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.description}</p>

              <ul className="space-y-1.5 mb-5">
                {p.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2 text-xs text-foreground/70">
                    <span className="mt-0.5 w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: p.color + '25' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all" style={{ color: p.color }}>
                Enter {p.role}
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          No backend — all data is in-memory + localStorage.{' '}
          <span className="font-medium">Mirpur slug:</span>{' '}
          <code className="font-mono bg-background border rounded px-1.5 py-0.5 text-[11px]">1to99-market-dhaka-mirpur-tw3k9p</code>
        </p>
      </main>
    </div>
  )
}
