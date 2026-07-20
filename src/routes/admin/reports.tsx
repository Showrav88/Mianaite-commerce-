import { createFileRoute } from '@tanstack/react-router'
import { FileBarChart, TrendingUp, TrendingDown } from 'lucide-react'
import { useMemo } from 'react'
import { useAdminStore, fmt } from '@/lib/admin-store'
import { useOfficeStore, walletBalance } from '@/lib/office-store'
import { useMarketStore } from '@/lib/market-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import {
  filterPosOrders,
  groupSalesByDay,
  groupSalesByMonth,
  orderCogs,
  sumOrderRevenue,
  todayIso,
} from '@/lib/pos-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'

export const Route = createFileRoute('/admin/reports')({
  component: ReportsPage,
  head: () => ({ meta: [{ title: 'Reports — 1to99' }] }),
})

function ReportsPage() {
  const { user } = useAuth()
  const { products } = useAdminStore()
  const { wallet } = useOfficeStore()
  const { orders: marketOrders } = useMarketStore()
  const { t, tx } = useI18n()

  const myProducts = products.filter(p => p.shopId === user?.shopId)
  const counterOrders = useMemo(
    () => filterPosOrders(marketOrders, user?.shopId),
    [marketOrders, user?.shopId],
  )

  const today = todayIso()
  const monthPrefix = today.slice(0, 7)

  const dailySales = sumOrderRevenue(counterOrders.filter(o => o.createdAt === today))
  const monthlySales = sumOrderRevenue(counterOrders.filter(o => o.createdAt.startsWith(monthPrefix)))

  const dailyCogs = counterOrders
    .filter(o => o.createdAt === today)
    .reduce((s, o) => s + orderCogs(o, myProducts), 0)
  const monthlyCogs = counterOrders
    .filter(o => o.createdAt.startsWith(monthPrefix))
    .reduce((s, o) => s + orderCogs(o, myProducts), 0)

  const buyTx = wallet.filter(x => x.type === 'buy')
  const merchandiseBuy = buyTx.reduce((s, x) => s + (x.meta?.merchandise ?? x.amount), 0)
  const travelBuy = buyTx.reduce((s, x) => s + (x.meta?.travelExpense ?? 0), 0)
  const driverBuy = buyTx.reduce((s, x) => s + (x.meta?.driverBill ?? 0), 0)
  const otherBuy = buyTx.reduce((s, x) => s + (x.meta?.otherExpense ?? 0), 0)

  const walletIn = wallet.filter(x => x.type === 'deposit' || x.type === 'sell' || x.type === 'loan_repay').reduce((s, x) => s + x.amount, 0)
  const expenses = wallet.filter(x => x.type === 'expense' || x.type === 'salary').reduce((s, x) => s + x.amount, 0)

  const grossDaily = dailySales - dailyCogs
  const grossMonthly = monthlySales - monthlyCogs
  const netMonthly = grossMonthly - travelBuy - driverBuy - otherBuy - expenses

  const byDay = groupSalesByDay(counterOrders).slice(-14)
  const byMonth = groupSalesByMonth(counterOrders)

  const billBreakdown = counterOrders.slice(0, 8).map(o => {
    const cogs = orderCogs(o, myProducts)
    return {
      id: o.orderNumber,
      sales: o.total,
      cogs,
      profit: o.total - cogs,
      date: o.createdAt,
    }
  })

  const purchaseChart = [
    { name: tx('Merchandise', 'মাল'), value: merchandiseBuy },
    { name: tx('Travel', 'ভ্রমণ'), value: travelBuy },
    { name: tx('Driver', 'ড্রাইভার'), value: driverBuy },
    { name: tx('Shop expense', 'দোকান খরচ'), value: expenses },
  ]

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileBarChart className="w-7 h-7 text-orange-500" />
          {t('reports.title')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{tx('Counter POS sales, purchase breakdown, and profit (demo data).', 'কাউন্টার বিক্রয়, ক্রয় বিশ্লেষণ ও লাভ (ডেমো)।')}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">{tx("Today's sales", 'আজকের বিক্রয়')}</p>
            <p className="text-2xl font-bold text-emerald-600">{fmt(dailySales)}</p>
            <p className="text-xs text-muted-foreground mt-1">{tx('Gross profit est.', 'আনুমানিক মোট লাভ')}: {fmt(grossDaily)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">{tx('This month sales', 'এই মাসের বিক্রয়')}</p>
            <p className="text-2xl font-bold text-emerald-600">{fmt(monthlySales)}</p>
            <p className="text-xs text-muted-foreground mt-1">{tx('Gross profit est.', 'আনুমানিক মোট লাভ')}: {fmt(grossMonthly)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{tx('Net after buys & expenses', 'ক্রয়/খরচের পর নেট')}</p>
                <p className={`text-2xl font-bold ${netMonthly >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(netMonthly)}</p>
              </div>
              {netMonthly >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">{t('reports.walletBalance')}</p>
            <p className="text-2xl font-bold">{fmt(walletBalance(wallet))}</p>
            <p className="text-xs text-muted-foreground mt-1">{tx('Wallet inflow (all)', 'মোট প্রবেশ')}: {fmt(walletIn)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">{tx('Daily counter sales (14 days)', 'দৈনিক কাউন্টার বিক্রয়')}</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => String(v).slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Line type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">{tx('Monthly counter sales', 'মাসিক বিক্রয়')}</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="sales" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">{tx('Purchase & expense breakdown (wallet buys)', 'ক্রয় ও খরচের বিশ্লেষণ')}</CardTitle></CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={purchaseChart} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader><CardTitle className="text-base">{tx('Bill profit breakdown (recent counter bills)', 'বিল অনুযায়ী লাভ')}</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2">{tx('Bill', 'বিল')}</th>
                <th className="px-4 py-2">{tx('Date', 'তারিখ')}</th>
                <th className="px-4 py-2 text-right">{tx('Sales', 'বিক্রয়')}</th>
                <th className="px-4 py-2 text-right">{tx('COGS est.', 'কosten')}</th>
                <th className="px-4 py-2 text-right">{tx('Profit est.', 'লাভ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {billBreakdown.map(row => (
                <tr key={row.id}>
                  <td className="px-4 py-2 font-mono text-xs">{row.id}</td>
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2 text-right">{fmt(row.sales)}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">{fmt(row.cogs)}</td>
                  <td className={`px-4 py-2 text-right font-semibold ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(row.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
