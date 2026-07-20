import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Store, Lock, Eye, Globe, Crown, UserCog, User, Shield } from 'lucide-react'
import { z } from 'zod'
import { useAuth, DEMO_ACCOUNTS, DEMO_PASSWORD, type AuthUser } from '@/lib/auth'
import { useI18n, type Lang } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import { homeRouteForRole, canAccessAdminPath, canAccessCounter, canAccessSuperAdmin } from '@/lib/permissions'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  component: LoginPage,
  head: () => ({ meta: [{ title: '1to99 — Login' }] }),
})

function safeInternalPath(path: string | undefined): string | undefined {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return undefined
  if (path.includes('://')) return undefined
  return path
}

function resolveTarget(
  user: AuthUser,
  redirectPath: string | undefined,
): '/admin' | '/counter' | '/superadmin' {
  const safe = safeInternalPath(redirectPath)
  if (safe?.startsWith('/superadmin') && canAccessSuperAdmin(user.role)) return '/superadmin'
  if (safe?.startsWith('/counter') && canAccessCounter(user.role)) return '/counter'
  if (safe?.startsWith('/admin') && canAccessAdminPath(user.role, safe)) return '/admin'
  return homeRouteForRole(user.role)
}

function clearSessionStorage() {
  try {
    localStorage.removeItem('aiteshops_cart_v1')
    localStorage.removeItem('shop_cart_v1')
    localStorage.removeItem('market_counter_v1')
  } catch {}
}

const ROLE_META: Record<AuthUser['role'], { icon: typeof Crown; badgeKey: 'login.roleOwner' | 'login.roleManager' | 'login.roleStaff' | 'login.roleSuperAdmin'; color: string }> = {
  owner: { icon: Crown, badgeKey: 'login.roleOwner', color: 'violet' },
  manager: { icon: UserCog, badgeKey: 'login.roleManager', color: 'emerald' },
  staff: { icon: User, badgeKey: 'login.roleStaff', color: 'sky' },
  super_admin: { icon: Shield, badgeKey: 'login.roleSuperAdmin', color: 'violet' },
}

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const { t, lang, setLang } = useI18n()
  const { redirect: redirectRaw } = Route.useSearch()

  useEffect(() => {
    if (!user) return
    const target = resolveTarget(user, redirectRaw)
    void navigate({ to: target as never, replace: true })
  }, [user, navigate, redirectRaw])

  function handleLogin(account: AuthUser) {
    clearSessionStorage()
    login(account)
    const target = resolveTarget(account, redirectRaw)
    void navigate({ to: target as never })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500 mb-4 shadow-lg">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('login.officeTitle')}</h1>
          <p className="text-slate-400 text-sm mt-1.5">{t('login.officeSubtitle')}</p>
        </div>

        <div className="flex items-start gap-2 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 mb-5 text-xs text-slate-400">
          <Eye className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
          <span>
            {t('login.demoPasswordLabel')}:{' '}
            <span className="font-mono font-semibold text-slate-200">{DEMO_PASSWORD}</span>
          </span>
        </div>

        <div className="space-y-2">
          {DEMO_ACCOUNTS.filter(acc => acc.role !== 'super_admin').map(acc => {
            const meta = ROLE_META[acc.role]
            const Icon = meta.icon
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleLogin(acc)}
                className="w-full bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-white rounded-2xl p-4 flex items-center gap-4 transition-all text-left"
              >
                <div className="w-11 h-11 bg-orange-600/20 border border-orange-600/30 rounded-xl flex items-center justify-center shrink-0 text-orange-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-white">{acc.name}</span>
                    <Badge className="text-[10px] bg-slate-700 text-slate-300 border-0 px-1.5 py-0">
                      {t(meta.badgeKey)}
                    </Badge>
                  </div>
                  <p className="text-xs text-orange-400/80 mt-0.5 font-mono truncate">{acc.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Lock className="w-2.5 h-2.5 text-slate-500" />
                    <span className="text-[10px] font-mono text-slate-400">{DEMO_PASSWORD}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between mt-7">
          <p className="text-[11px] text-slate-600">{t('login.noOnlineShop')}</p>
          <button
            onClick={() => setLang((lang === 'en' ? 'bn' : 'en') as Lang)}
            className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'en' ? t('common.viewInBangla') : t('common.viewInEnglish')}
          </button>
        </div>
      </div>
    </div>
  )
}
