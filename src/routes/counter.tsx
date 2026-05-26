import { createFileRoute, Outlet, Link, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Store, BarChart2, ArrowLeft } from 'lucide-react'
import { useMarketStore } from '@/lib/market-store'
import { useI18n } from '@/lib/i18n'

export const Route = createFileRoute('/counter')({
  component: CounterLayout,
})

function CounterLayout() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: s => s.location.pathname })
  const { currentShift } = useMarketStore()
  const { t, lang } = useI18n()

  useEffect(() => {
    if (pathname === '/counter') void navigate({ to: '/counter', replace: true })
  }, [pathname, navigate])

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden flex-col">
      {/* Slim top bar */}
      <header className="h-11 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
              <Store className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">{t('counter.counter1to99')}</span>
          </div>
          {currentShift && !currentShift.endedAt && (
            <span className="text-[10px] font-medium text-emerald-400 border border-emerald-800 bg-emerald-950 rounded-full px-2 py-0.5 uppercase tracking-wide">
              {t('counter.shiftActive')} · {currentShift.cashier}
            </span>
          )}
        </div>
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
      </header>

      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
