import { createFileRoute } from '@tanstack/react-router'
import { FileBarChart, TrendingUp, TrendingDown } from 'lucide-react'
import { useAdminStore, fmt, profitAmount } from '@/lib/admin-store'
import { useOfficeStore, walletBalance } from '@/lib/office-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export const Route = createFileRoute('/admin/reports')({
  component: ReportsPage,
  head: () => ({ meta: [{ title: 'Reports — 1to99' }] }),
})

function ReportsPage() {
  const { user } = useAuth()
  const { products, orders } = useAdminStore()
  const { wallet } = useOfficeStore()
  const { lang } = useI18n()

  const myProducts = products.filter(p => p.shopId === user?.shopId)
  const myOrders = orders.filter(o => o.shopId === user?.shopId && o.status !== 'cancelled')

  const retailRevenue = myOrders.reduce((s, o) => s + o.subtotal, 0)
  const walletIn = wallet.filter(t => t.type === 'sell' || t.type === 'loan_repay').reduce((s, t) => s + t.amount, 0)
  const purchases = wallet.filter(t => t.type === 'buy').reduce((s, t) => s + t.amount, 0)
  const expenses = wallet.filter(t => t.type === 'expense' || t.type === 'salary').reduce((s, t) => s + t.amount, 0)
  const grossProfit = myProducts.reduce((s, p) => {
    if (!p.costPrice) return s
    return s + profitAmount(p) * (p.sold ?? 0)
  }, 0)

  const chartData = [
    { name: lang === 'bn' ? 'বিক্রয়' : 'Sales', value: walletIn || retailRevenue },
    { name: lang === 'bn' ? 'ক্রয়' : 'Purchases', value: purchases },
    { name: lang === 'bn' ? 'খরচ' : 'Expenses', value: expenses },
  ]

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileBarChart className="w-7 h-7 text-orange-500" />
          {lang === 'bn' ? 'ক্রয়, খরচ ও লাভ-ক্ষতি' : 'Purchase, expense & P/L'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === 'bn' ? 'ডেমো ডেটা — কাউন্টার ও ওয়ালেট থেকে সংক্ষিপ্ত রিপোর্ট।' : 'Demo summary from counter records and wallet entries.'}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{lang === 'bn' ? 'মোট বিক্রয়' : 'Total sales'}</p>
                <p className="text-2xl font-bold text-emerald-600">{fmt(walletIn || retailRevenue)}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{lang === 'bn' ? 'ক্রয় + খরচ' : 'Buy + expenses'}</p>
                <p className="text-2xl font-bold text-red-600">{fmt(purchases + expenses)}</p>
              </div>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">{lang === 'bn' ? 'ওয়ালেট ব্যালেন্স' : 'Wallet balance'}</p>
            <p className="text-2xl font-bold">{fmt(walletBalance(wallet))}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {lang === 'bn' ? 'আনুমানিক মুনাফা (ক্যাটালগ)' : 'Est. catalog margin'}: {fmt(grossProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{lang === 'bn' ? 'সারাংশ চার্ট' : 'Summary chart'}</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
