import { createFileRoute } from '@tanstack/react-router'
import { useMarketStore, expectedDrawerCash, shiftDurationMinutes } from '@/lib/market-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { fmt } from '@/lib/admin-store'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/admin/shifts')({
  component: OwnerShiftsPage,
  head: () => ({ meta: [{ title: 'Staff Shifts — 1to99' }] }),
})

function OwnerShiftsPage() {
  const { user } = useAuth()
  const shopId = user?.shopId ?? 'shop_6'
  const { shiftsForShop, getActiveShift } = useMarketStore()
  const { tx } = useI18n()

  const rows = shiftsForShop(shopId)
  const active = getActiveShift(shopId)

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{tx('Staff shifts & cash drawer', 'কর্মী শিফট ও নগদ দরাজ')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tx(
            'Who worked, how long, how much they sold, and cash drawer open/close counts. Mismatches are recorded at shift handoff.',
            'কে কতক্ষণ কাজ করেছে, কত বিক্রি, দরাজে খোলা/শেষ নগদ — হ্যান্ডওফে পার্থক্য লিপিবদ্ধ হয়।',
          )}
        </p>
      </div>

      {active && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-emerald-900">{tx('Live shift', 'চলমান শিফট')}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><strong>{active.staffName}</strong> ({active.staffRole})</p>
            <p>{tx('Started', 'শুরু')}: {format(new Date(active.startedAt), 'PPp')}</p>
            <p>{tx('Opening cash', 'খোলার নগদ')}: {fmt(active.openingCash)}</p>
            <p>{tx('Sales', 'বিক্রয়')}: {active.totals.bills} · {fmt(active.totals.revenue)}</p>
            <p>{tx('Expected drawer now', 'এখন দরাজে আনুমানিক')}: <strong>{fmt(expectedDrawerCash(active))}</strong></p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tx('Shift history', 'শিফট ইতিহাস')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-3">{tx('Staff', 'কর্মী')}</th>
                <th className="px-4 py-3">{tx('When', 'সময়')}</th>
                <th className="px-4 py-3">{tx('Duration', 'সময়কাল')}</th>
                <th className="px-4 py-3">{tx('Sales', 'বিক্রয়')}</th>
                <th className="px-4 py-3">{tx('Open → Close cash', 'খোলা → শেষ নগদ')}</th>
                <th className="px-4 py-3">{tx('Variance', 'পার্থক্য')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{tx('No shifts yet.', 'এখনো শিফট নেই।')}</td></tr>
              )}
              {rows.map(s => (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.staffName}</p>
                    <p className="text-xs text-muted-foreground">{s.staffRole}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {format(new Date(s.startedAt), 'dd MMM HH:mm')}
                    {s.endedAt && ` – ${format(new Date(s.endedAt), 'HH:mm')}`}
                    {!s.endedAt && <Badge className="ml-1 text-[10px]">{tx('Active', 'চলছে')}</Badge>}
                  </td>
                  <td className="px-4 py-3">{shiftDurationMinutes(s)}m</td>
                  <td className="px-4 py-3">
                    {s.totals.bills} {tx('bills', 'বিল')} · {fmt(s.totals.revenue)}
                    <p className="text-[10px] text-muted-foreground">{tx('Cash', 'নগদ')}: {fmt(s.totals.cash)}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {fmt(s.openingCash)} → {s.closingCash != null ? fmt(s.closingCash) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {s.cashVariance != null && s.cashVariance !== 0 ? (
                      <span className="text-amber-700 font-medium">{fmt(s.cashVariance)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
