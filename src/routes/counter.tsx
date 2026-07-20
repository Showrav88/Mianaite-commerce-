import { createFileRoute, useNavigate, useRouterState, Link, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Store, BarChart2, ArrowLeft, LogOut, Tag, Package, Globe } from 'lucide-react'
import { useMarketStore } from '@/lib/market-store'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { canAccessCounter, canAccessAdminPath } from '@/lib/permissions'

export const Route = createFileRoute('/counter')({
  component: CounterLayout,
})

function CounterLayout() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: s => s.location.pathname })
  const { currentShift } = useMarketStore()
  const { t, lang, setLang } = useI18n()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (!user) {
      void navigate({ to: '/login', search: { redirect: '/counter' }, replace: true })
      return
    }
    if (!canAccessCounter(user.role)) {
      void navigate({ to: '/login', replace: true })
    }
  }, [user, navigate])

  if (!user) return null

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden flex-col">
      <header className="h-11 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-slate-400 hover:text-white transition-colors" title={t('admin.logout')}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
              <Store className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">{t('counter.brandPos')}</span>
          </div>
          {currentShift && !currentShift.endedAt && (
            <span className="text-[10px] font-medium text-emerald-400 border border-emerald-800 bg-emerald-950 rounded-full px-2 py-0.5 uppercase tracking-wide">
              {t('counter.shiftActive')} · {currentShift.cashier}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canAccessAdminPath(user.role, '/admin/inventory') && (
            <Link to="/admin/inventory" className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800">
              <Package className="w-3.5 h-3.5" />
              {t('counter.linkStock')}
            </Link>
          )}
          {canAccessAdminPath(user.role, '/admin/labels') && (
            <Link to="/admin/labels" className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800">
              <Tag className="w-3.5 h-3.5" />
              {t('counter.linkLabels')}
            </Link>
          )}
          <Link
            to="/counter/shifts"
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded transition-colors ${
              pathname === '/counter/shifts'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            {t('counter.shiftReport')}
          </Link>
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="text-slate-400 hover:text-white p-1"
            title={lang === 'en' ? t('common.viewInBangla') : t('common.viewInEnglish')}
          >
            <Globe className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => { logout(); void navigate({ to: '/login' }) }}
            className="text-slate-400 hover:text-red-400 p-1"
            title={t('admin.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
