import { createFileRoute } from '@tanstack/react-router'
import { useMarketStore, expectedDrawerCash, shiftDurationMinutes } from '@/lib/market-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { fmt } from '@/lib/admin-store'
import { format } from 'date-fns'
import { TrendingUp, ShoppingCart, Banknote, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/counter/shifts')({
  component: ShiftReport,
  head: () => ({ meta: [{ title: 'Shift Report — Counter' }] }),
})

function ShiftReport() {
  const { user } = useAuth()
  const shopId = user?.shopId ?? 'shop_6'
  const { getActiveShift, shiftsForShop, orders } = useMarketStore()
  const { t, lang, tx } = useI18n()

  const active = getActiveShift(shopId)
  const history = shiftsForShop(shopId)

  if (!active && history.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-slate-300 font-medium">{t('counter.noShift')}</p>
          <p className="text-slate-500 text-sm mt-1">{t('counter.noShiftHint')}</p>
        </div>
      </div>
    )
  }

  const shift = active ?? history[0]
  const shiftOrders = orders.filter(o => shift.orderIds.includes(o.id))
  const startedAt = new Date(shift.startedAt)
  const expected = active ? expectedDrawerCash(shift) : (shift.expectedCash ?? shift.openingCash)

  const paymentBreakdown = shiftOrders.reduce((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] ?? 0) + o.total
    return acc
  }, {} as Record<string, number>)

  const kpis = [
    { icon: ShoppingCart, label: t('counter.sales'), value: String(shift.totals.bills), color: '#34d399' },
    { icon: TrendingUp, label: t('counter.revenue'), value: fmt(shift.totals.revenue), color: '#60a5fa' },
    { icon: Banknote, label: t('counter.openCash'), value: fmt(shift.openingCash), color: '#a78bfa' },
    { icon: Clock, label: t('counter.duration'), value: `${shiftDurationMinutes(shift)}m`, color: '#fb923c' },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-bold text-white">{t('counter.shiftReport')}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {shift.staffName} · {t('counter.started')} {format(startedAt, 'dd MMM yyyy, hh:mm a')}
          {shift.endedAt && ` · ${format(new Date(shift.endedAt), 'hh:mm a')}`}
        </p>
        {active && (
          <p className="text-sm text-emerald-400 mt-2">
            {tx('Expected drawer cash', 'দরাজে আনুমানিক নগদ')}: <strong>{fmt(expected)}</strong>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(stat => (
          <Card key={stat.label} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4 pb-3">
              <stat.icon className="w-4 h-4 mb-2" style={{ color: stat.color }} />
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {shift.cashVariance != null && shift.cashVariance !== 0 && (
        <div className="flex items-start gap-2 bg-amber-950/50 border border-amber-800 rounded-lg p-3 text-sm text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            {tx('Cash variance at close', 'শেষে নগদ পার্থক্য')}: <strong>{fmt(shift.cashVariance)}</strong>
            {shift.handoffNote && <p className="text-xs mt-1 opacity-80">{shift.handoffNote}</p>}
          </div>
        </div>
      )}

      {Object.keys(paymentBreakdown).length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-white">{t('counter.payBreakdown')}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(paymentBreakdown).map(([method, amount]) => (
              <div key={method} className="flex justify-between text-sm">
                <Badge variant="outline" className="capitalize">{method}</Badge>
                <span className="text-white font-semibold">{fmt(amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3"><CardTitle className="text-sm text-white">{t('counter.shiftOrders')} ({shiftOrders.length})</CardTitle></CardHeader>
        <CardContent className="divide-y divide-slate-700 p-0">
          {shiftOrders.length === 0 ? (
            <p className="text-slate-500 text-sm px-5 py-4">{t('counter.noShiftOrders')}</p>
          ) : shiftOrders.map(o => (
            <div key={o.id} className="px-5 py-3 flex justify-between">
              <div>
                <p className="text-sm font-mono text-slate-300">{o.orderNumber}</p>
                <p className="text-xs text-slate-500">{o.customerName}</p>
              </div>
              <p className="font-semibold text-emerald-400">{fmt(o.total)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {history.length > 1 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-white">{tx('Recent shifts', 'সাম্প্রতিক শিফট')}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {history.slice(active ? 1 : 0, 8).map(s => (
              <div key={s.id} className="flex justify-between text-slate-300 border-b border-slate-700 pb-2">
                <span>{s.staffName} · {format(new Date(s.startedAt), 'dd MMM')}</span>
                <span>{fmt(s.totals.revenue)} · {shiftDurationMinutes(s)}m</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
