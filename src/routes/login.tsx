import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Store, ShieldCheck, Lock, Eye, Globe } from 'lucide-react'
import { z } from 'zod'
import { useAuth, DEMO_ACCOUNTS, DEMO_PASSWORD, type AuthUser } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  component: LoginPage,
  head: () => ({ meta: [{ title: 'Login Portal — 1to99 Market' }] }),
})

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

function clearSessionStorage() {
  try {
    localStorage.removeItem('aiteshops_cart_v1')
    localStorage.removeItem('shop_cart_v1')
    localStorage.removeItem('market_counter_v1')
  } catch {}
}

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const { t, lang, setLang } = useI18n()
  const { redirect: redirectRaw } = Route.useSearch()
  const redirectPath = safeInternalPath(redirectRaw)

  useEffect(() => {
    if (!user) return
    const target = redirectPath && canAccessPath(user.role, redirectPath) ? redirectPath : undefined
    void navigate({ to: (target ?? (user.role === 'super_admin' ? '/superadmin' : '/admin')) as never, replace: true })
  }, [user, navigate, redirectPath])

  function handleLogin(account: AuthUser) {
    clearSessionStorage()
    login(account)
    const target = redirectPath && canAccessPath(account.role, redirectPath) ? redirectPath : undefined
    void navigate({ to: (target ?? (account.role === 'super_admin' ? '/superadmin' : '/admin')) as never })
  }

  const superAccount = DEMO_ACCOUNTS[0]
  const shopAccounts = DEMO_ACCOUNTS.slice(1)

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 mb-4 shadow-lg">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('login.title')}</h1>
          <p className="text-slate-400 text-sm mt-1.5">{t('login.subtitle')}</p>
        </div>

        {/* Credentials notice */}
        <div className="flex items-start gap-2 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 mb-5 text-xs text-slate-400">
          <Eye className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
          <span>
            {t('login.allPassword')} <span className="font-mono font-semibold text-slate-200">{DEMO_PASSWORD}</span> — {t('login.credInfo')}
          </span>
        </div>

        {/* Super Admin */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 px-1">{t('login.platform')}</p>
          <button
            type="button"
            onClick={() => handleLogin(superAccount)}
            className="w-full bg-violet-950/60 hover:bg-violet-900/60 border border-violet-700/50 hover:border-violet-500/70 text-white rounded-2xl p-4 flex items-center gap-4 transition-all text-left group"
          >
            <div className="w-11 h-11 bg-violet-600 rounded-xl flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-white">{lang === 'bn' ? '১টু৯৯ মার্কেট অ্যাডমিন' : '1to99 Market Admin'}</span>
                <Badge className="text-[10px] bg-violet-700/60 text-violet-200 border-0 px-1.5 py-0">
                  {lang === 'bn' ? 'প্ল্যাটফর্ম' : 'Platform'}
                </Badge>
              </div>
              <p className="text-xs text-violet-300 mt-0.5 font-mono">{superAccount.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <Lock className="w-2.5 h-2.5 text-slate-500" />
                <span className="text-[10px] font-mono text-slate-400">{DEMO_PASSWORD}</span>
              </div>
            </div>
          </button>
        </div>

        {/* Shop Admins */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 px-1">{t('login.shopAdmins')}</p>
          <div className="space-y-2">
            {shopAccounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => handleLogin(acc)}
                className="w-full bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-white rounded-2xl p-4 flex items-center gap-4 transition-all text-left"
              >
                <div className="w-11 h-11 bg-emerald-600/20 border border-emerald-600/30 rounded-xl flex items-center justify-center shrink-0 text-emerald-400 font-bold text-lg">
                  {acc.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-white">{acc.name}</span>
                    <Badge className="text-[10px] bg-slate-700 text-slate-300 border-0 px-1.5 py-0">{acc.shopName}</Badge>
                  </div>
                  <p className="text-xs text-emerald-400/80 mt-0.5 font-mono truncate">{acc.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Lock className="w-2.5 h-2.5 text-slate-500" />
                    <span className="text-[10px] font-mono text-slate-400">{DEMO_PASSWORD}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-7">
          <p className="text-[11px] text-slate-600">{t('login.demo')}</p>
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'en' ? 'বাংলা' : 'English'}
          </button>
        </div>
      </div>
    </div>
  )
}
