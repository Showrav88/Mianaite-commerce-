import { createFileRoute } from '@tanstack/react-router'
import { useMarketStore } from '@/lib/market-store'
import { useI18n } from '@/lib/i18n'
import { MARKET_ORDERS } from '@/mock/orders'
import { format } from 'date-fns'
import { TrendingUp, ShoppingCart, Banknote, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/counter/shifts')({
  component: ShiftReport,
  head: () => ({ meta: [{ title: 'Shift Report — Counter' }] }),
})

const fmt = (n: number) => `৳${n.toLocaleString('en-BD')}`

function ShiftReport() {
  const { currentShift, orders } = useMarketStore()
  const { t, lang } = useI18n()

  if (!currentShift) {
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

  const shiftOrders = orders.filter(o => currentShift.orders.includes(o.id))
  const allCounterOrders = [...MARKET_ORDERS, ...orders].filter(o =>
    o.source === 'counter' && o.shopId === 'shop_mirpur'
  )

  const shiftRevenue = shiftOrders.reduce((s, o) => s + o.total, 0)

  const paymentBreakdown = shiftOrders.reduce((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] ?? 0) + o.total
    return acc
  }, {} as Record<string, number>)

  const startedAt = new Date(currentShift.startedAt)

  const payBadgeColor: Record<string, string> = {
    cash: 'bg-emerald-900 text-emerald-300',
    card: 'bg-blue-900 text-blue-300',
    bkash: 'bg-pink-900 text-pink-300',
    nagad: 'bg-orange-900 text-orange-300',
    split: 'bg-purple-900 text-purple-300',
  }

  const kpis = [
    { icon: ShoppingCart, label: t('counter.sales'), value: String(shiftOrders.length), color: '#34d399' },
    { icon: TrendingUp, label: t('counter.revenue'), value: fmt(shiftRevenue), color: '#60a5fa' },
    { icon: Banknote, label: t('counter.openCash'), value: fmt(currentShift.openingCash), color: '#a78bfa' },
    { icon: Clock, label: t('counter.duration'), value: `${Math.round((Date.now() - startedAt.getTime()) / 60000)}m`, color: '#fb923c' },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-bold text-white">{t('counter.shiftReport')}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {currentShift.cashier} · {t('counter.started')} {format(startedAt, 'dd MMM yyyy, hh:mm a')}
          {currentShift.endedAt && ` · ${lang === 'bn' ? 'শেষ' : 'Ended'} ${format(new Date(currentShift.endedAt), 'hh:mm a')}`}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(stat => (
          <Card key={stat.label} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4 pb-3">
              <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: stat.color + '25' }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className="text-lg font-bold text-white mt-0.5">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment breakdown */}
      {Object.keys(paymentBreakdown).length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">{t('counter.payBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(paymentBreakdown).map(([method, amount]) => (
              <div key={method} className="flex items-center justify-between">
                <Badge className={`text-xs capitalize ${payBadgeColor[method] ?? 'bg-slate-700 text-slate-300'}`}>
                  {method}
                </Badge>
                <span className="text-white font-semibold text-sm">{fmt(amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Shift orders */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white">{t('counter.shiftOrders')} ({shiftOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {shiftOrders.length === 0 ? (
            <p className="text-slate-500 text-sm px-5 py-4">{t('counter.noShiftOrders')}</p>
          ) : (
            <div className="divide-y divide-slate-700">
              {shiftOrders.map(o => (
                <div key={o.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono text-slate-300">{o.orderNumber}</p>
                    <p className="text-xs text-slate-500">{o.items.length} {t('common.item')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{fmt(o.total)}</p>
                    <Badge className={`text-[10px] capitalize ${payBadgeColor[o.paymentMethod] ?? ''}`}>{o.paymentMethod}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's counter summary */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white">{t('counter.counterSummary')} — {lang === 'bn' ? 'মিরপুর' : 'Mirpur'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-white">{fmt(allCounterOrders.reduce((s, o) => s + o.total, 0))}</p>
          <p className="text-xs text-slate-400 mt-1">{allCounterOrders.length} {t('counter.allTime')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
