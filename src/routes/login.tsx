import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Store, Globe, ShieldCheck } from 'lucide-react'
import { z } from 'zod'
import { useAuth, DEMO_ACCOUNTS, type AuthUser } from '@/lib/auth'
import { useAdminStore } from '@/lib/admin-store'
import { useI18n } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'

const loginSearchSchema = z.object({
  /** After login, go here if the account is allowed (internal path only). */
  redirect: z.string().optional(),
  /** Show only this shop's admin account (e.g. "mood-on"). */
  shop: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ search }) => {
    if (!search.shop && !search.redirect?.startsWith('/superadmin')) {
      throw redirect({ to: '/login', search: { ...search, shop: 'mood-on' } })
    }
  },
  component: LoginPage,
  head: () => ({ meta: [{ title: 'Login — AITeShops Admin' }] }),
})

/** Avoid open redirects: same-app paths only. */
function safeInternalPath(path: string | undefined): string | undefined {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return undefined
  if (path.includes('://')) return undefined
  return path
}

function canAccessPath(role: AuthUser['role'], path: string): boolean {
  if (path === '/superadmin' || path.startsWith('/superadmin/')) return role === 'super_admin'
  if (path === '/admin' || path.startsWith('/admin/')) return role === 'shop_admin' || role === 'super_admin'
  return false
}

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const { redirect: redirectRaw, shop: shopSlugFilter } = Route.useSearch()
  const redirect = safeInternalPath(redirectRaw)
  const showSuperAdminEntry = Boolean(redirect?.startsWith('/superadmin'))
  const { lang, setLang } = useI18n()
  const { shops } = useAdminStore()

  // Resolve filtered shop when ?shop=slug is present
  const filteredShop = shopSlugFilter ? shops.find(s => s.slug === shopSlugFilter) : null
  const isShopSpecific = Boolean(filteredShop)

  useEffect(() => {
    if (!user) return
    const target = redirect && canAccessPath(user.role, redirect) ? redirect : undefined
    if (target) {
      void navigate({ to: target as never, replace: true })
      return
    }
    void navigate({ to: user.role === 'super_admin' ? '/superadmin' : '/admin', replace: true })
  }, [user, navigate, redirect])

  function handleLogin(account: AuthUser) {
    login(account)
    const target = redirect && canAccessPath(account.role, redirect) ? redirect : undefined
    if (target) {
      void navigate({ to: target as never })
      return
    }
    void navigate({ to: account.role === 'super_admin' ? '/superadmin' : '/admin' })
  }

  const superAccount = DEMO_ACCOUNTS[0]
  const allShopAccounts = DEMO_ACCOUNTS.slice(1)

  // Filter: if ?shop=mood-on, show only Mood On admin
  const shopAccounts = filteredShop
    ? allShopAccounts.filter(a => a.shopId === filteredShop.id)
    : allShopAccounts

  // Mood On specific styling
  const shopPrimary = filteredShop?.theme.primaryColor ?? null
  const shopAccent = filteredShop?.theme.accentColor ?? null
  const shopLogo = filteredShop?.logo ?? null

  if (isShopSpecific && filteredShop) {
    // Branded login page for a specific shop
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: `linear-gradient(135deg, ${shopPrimary}f0 0%, ${shopPrimary}cc 50%, #000 100%)` }}
      >
        <style>{`
          @keyframes goldShimmer {
            0%,100% { opacity:0.7; }
            50% { opacity:1; }
          }
          .gold-shimmer { animation: goldShimmer 2.5s ease-in-out infinite; }
        `}</style>

        <div className="w-full max-w-sm">
          {/* Shop brand header */}
          <div className="text-center mb-8">
            {shopLogo ? (
              <img
                src={shopLogo}
                alt={filteredShop.name}
                className="w-28 h-28 mx-auto rounded-2xl object-cover mb-4 shadow-2xl gold-shimmer"
                style={{ border: `2px solid ${shopAccent}60` }}
              />
            ) : (
              <div
                className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 shadow-xl"
                style={{ backgroundColor: shopAccent ?? '#fff', color: shopPrimary ?? '#000' }}
              >
                {filteredShop.name.charAt(0)}
              </div>
            )}
            <h1 className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {filteredShop.name}
            </h1>
            <p className="text-sm mt-1" style={{ color: shopAccent ?? '#ccc' }}>
              {lang === 'en' ? 'Admin Login' : 'অ্যাডমিন লগইন'}
            </p>
            {filteredShop.createdAt && (
              <p className="text-xs mt-0.5 text-white/40">
                {lang === 'en' ? `Since ${filteredShop.createdAt.slice(0, 4)}` : `${filteredShop.createdAt.slice(0, 4)} সাল থেকে`}
              </p>
            )}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'en' ? 'বাংলায় দেখুন' : 'View in English'}
            </button>
          </div>

          {/* Accounts */}
          <div className="space-y-3">
            {shopAccounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => handleLogin(acc)}
                className="w-full border text-white rounded-2xl p-4 flex items-center gap-4 transition-all text-left hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  backgroundColor: `${shopPrimary}80`,
                  borderColor: `${shopAccent}50`,
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${shopPrimary}bb`)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${shopPrimary}80`)}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold shadow-lg"
                  style={{ backgroundColor: shopAccent ?? '#fff', color: shopPrimary ?? '#000' }}
                >
                  {acc.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white">{acc.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: shopAccent ?? '#ccc' }}>{acc.email}</p>
                  <p className="text-[10px] mt-0.5 text-white/40">{acc.shopName}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-white/30 mt-8">
            {lang === 'en' ? '🔒 Demo mode — no real authentication' : '🔒 ডেমো মোড'}
          </p>
        </div>
      </div>
    )
  }

  // Default login page (all shops)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AITeShops</span>
          </div>
          <p className="text-slate-400 text-sm">
            {lang === 'en' ? 'Admin Panel — Select your account to continue' : 'অ্যাডমিন প্যানেল — আপনার অ্যাকাউন্ট বেছে নিন'}
          </p>
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'en' ? 'বাংলায় দেখুন' : 'View in English'}
          </button>
        </div>

        {/* Super admin: only when opening /superadmin (or ?redirect=/superadmin) */}
        {showSuperAdminEntry && (
          <div className="mb-6">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 px-1">
              {lang === 'en' ? 'Super Admin (demo)' : 'সুপার অ্যাডমিন (ডেমো)'}
            </p>
            <button
              type="button"
              onClick={() => handleLogin(superAccount)}
              className="w-full bg-violet-900/40 hover:bg-violet-900/60 border border-violet-500/40 hover:border-violet-400/60 text-white rounded-xl p-4 flex items-center gap-4 transition-all text-left"
            >
              <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{superAccount.name}</span>
                  <Badge variant="outline" className="text-xs border-violet-400/50 text-violet-200">
                    {lang === 'en' ? 'Platform' : 'প্ল্যাটফর্ম'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{superAccount.email}</p>
              </div>
            </button>
          </div>
        )}

        {/* Shop Admins */}
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 px-1">
            {lang === 'en' ? 'Admin Accounts' : 'অ্যাডমিন অ্যাকাউন্ট'}
          </p>
          <div className="space-y-2">
            {shopAccounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => handleLogin(acc)}
                className="w-full bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 text-white rounded-xl p-4 flex items-center gap-4 transition-all text-left"
              >
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0 text-primary font-bold text-lg">
                  {acc.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{acc.name}</span>
                    <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                      {acc.shopName}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{acc.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          {lang === 'en' ? '🔒 Demo mode — no real authentication' : '🔒 ডেমো মোড — কোনো বাস্তব প্রমাণীকরণ নেই'}
        </p>
      </div>
    </div>
  )
}
