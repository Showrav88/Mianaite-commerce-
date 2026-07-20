import { createFileRoute, Link } from '@tanstack/react-router'
import { Package, AlertTriangle, TrendingUp, ArrowUpRight, ScanLine, Wallet, Truck, Lock } from 'lucide-react'
import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAdminStore, fmt } from '@/lib/admin-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { useMarketStore } from '@/lib/market-store'
import { useOfficeStore, walletBalance, dealGrandTotal } from '@/lib/office-store'
import { filterPosOrders, groupSalesByDay, sumOrderRevenue, todayIso } from '@/lib/pos-stats'
import { ProductThumb } from '@/components/office/ProductThumb'
import { OFFICE_IMAGES_LOCKED } from '@/lib/media-lock'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: 'Office Dashboard — 1to99' }] }),
})

function StatCard({ icon: Icon, label, value, sub, color }: { icon: typeof Package; label: string; value: string; sub?: string; color: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AdminDashboard() {
  const { user } = useAuth()
  const { products, shops } = useAdminStore()
  const { orders: posOrdersAll, currentShift } = useMarketStore()
  const { wallet, supplierDeals, suppliers } = useOfficeStore()
  const { t, lang, tx } = useI18n()

  const shop = shops.find(s => s.id === user?.shopId)
  const primaryColor = shop?.theme.primaryColor ?? '#f97316'
  const today = todayIso()

  const counterOrders = useMemo(
    () => filterPosOrders(posOrdersAll, user?.shopId),
    [posOrdersAll, user?.shopId],
  )

  const myProducts = products.filter(p => p.shopId === user?.shopId)
  const lowStockItems = myProducts.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0)
  const outOfStock = myProducts.filter(p => p.stock === 0)
  const todayCounter = counterOrders.filter(o => o.createdAt === today)
  const todaySales = sumOrderRevenue(todayCounter)
  const monthPrefix = today.slice(0, 7)
  const monthCounter = counterOrders.filter(o => o.createdAt.startsWith(monthPrefix))
  const monthSales = sumOrderRevenue(monthCounter)
  const balance = walletBalance(wallet)
  const pendingDeals = supplierDeals.filter(d => d.status === 'awaiting_payment')
  const paidAwaitingStock = supplierDeals.filter(d => d.status === 'paid')
  const freshStart = wallet.length === 0 && suppliers.length === 0 && myProducts.length === 0

  const weekChart = useMemo(() => {
    const byDay = groupSalesByDay(counterOrders)
    const last7 = byDay.slice(-7)
    return last7.map(d => ({
      day: d.date.slice(5),
      sales: d.sales,
    }))
  }, [counterOrders])

  const recentBills = counterOrders.slice(0, 5)

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('admin.welcome')}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tx('Counter POS & back office — no online orders', 'কাউন্টার POS ও ব্যাক অফিস — অনলাইন অর্ডার নেই')}
          </p>
        </div>
        {OFFICE_IMAGES_LOCKED && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
            <Lock className="w-3.5 h-3.5" />
            {tx('Product images locked', 'পণ্যের ছবি লক')}
          </span>
        )}
      </div>

      {freshStart && (
        <Card className="border-2 border-dashed border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{tx('Getting started (empty shop)', 'শুরু করুন — খালি দোকান')}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <ol className="list-decimal pl-5 space-y-1">
              <li><Link to="/admin/wallet" className="text-orange-600 font-medium hover:underline">{tx('Wallet — manual deposit', 'ওয়ালেট — জমা')}</Link></li>
              <li><Link to="/admin/suppliers" className="text-orange-600 font-medium hover:underline">{tx('Suppliers — add & create deal', 'সাপ্লায়ার ও ডিল')}</Link></li>
              <li>{tx('Pay deal (confirm popup) — wallet charged', 'ডিল পেমেন্ট — ওয়ালেট কাটা')}</li>
              <li><Link to="/admin/catalog/products/$id" params={{ id: 'new' }} className="text-orange-600 font-medium hover:underline">{tx('Or add products / stock manually', 'অথবা পণ্য/স্টক ম্যানুয়াল')}</Link></li>
              <li><Link to="/admin/sell" className="text-orange-600 font-medium hover:underline">{tx('Counter sale — income to wallet', 'কাউন্টার বিক্রয়')}</Link></li>
              <li><Link to="/admin/reports" className="text-orange-600 font-medium hover:underline">{tx('Reports — profit check', 'রিপোর্ট — লাভ')}</Link></li>
            </ol>
          </CardContent>
        </Card>
      )}

      {(lowStockItems.length > 0 || outOfStock.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            {lowStockItems.length > 0 && (
              <p className="text-sm font-medium text-amber-800">
                {lang === 'en'
                  ? `${lowStockItems.length} product(s) running low on stock`
                  : `${lowStockItems.length}টি পণ্যের স্টক কম`}
              </p>
            )}
            {outOfStock.length > 0 && (
              <p className="text-sm text-amber-700 mt-0.5">
                {lang === 'en'
                  ? `${outOfStock.length} product(s) out of stock`
                  : `${outOfStock.length}টি পণ্যের স্টক শেষ`}
              </p>
            )}
          </div>
          <Link to="/admin/inventory" className="text-xs font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1">
            {tx('Restock', 'পুনঃস্টক')} <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ScanLine}
          label={tx("Today's counter sales", 'আজকের কাউন্টার বিক্রয়')}
          value={fmt(todaySales)}
          sub={`${todayCounter.length} ${tx('bills', 'বিল')}`}
          color={primaryColor}
        />
        <StatCard
          icon={TrendingUp}
          label={tx('This month (counter)', 'এই মাস (কাউন্টার)')}
          value={fmt(monthSales)}
          sub={`${monthCounter.length} ${tx('bills', 'বিল')}`}
          color="#22c55e"
        />
        <StatCard
          icon={Wallet}
          label={t('wallet.balance')}
          value={fmt(balance)}
          sub={tx('Pay supplier deals from here', 'সাপ্লায়ার ডিল এখান থেকে পরিশোধ')}
          color="#6366f1"
        />
        <StatCard
          icon={Package}
          label={t('admin.products')}
          value={String(myProducts.length)}
          sub={`${pendingDeals.length} ${tx('deals to pay', 'ডিল বাকি')}`}
          color="#f97316"
        />
      </div>

      {(currentShift || pendingDeals.length > 0 || paidAwaitingStock.length > 0) && (
        <div className="grid sm:grid-cols-3 gap-4">
          {currentShift && (
            <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">{tx('Counter shift open', 'কাউন্টার শিফট চালু')}</p>
                <p className="font-semibold">{currentShift.cashier}</p>
                <p className="text-xs text-muted-foreground mt-1">{currentShift.startedAt}</p>
                <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                  <Link to="/counter">{t('nav.fullPos')}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {pendingDeals.length > 0 && (
            <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> {tx('Supplier deals — payment due', 'সাপ্লায়ার ডিল — পেমেন্ট বাকি')}</p>
                <p className="text-lg font-bold">{pendingDeals.length}</p>
                <p className="text-xs text-muted-foreground">{fmt(pendingDeals.reduce((s, d) => s + dealGrandTotal(d), 0))} {tx('total', 'মোট')}</p>
                <Button asChild size="sm" className="mt-3 w-full text-white" style={{ backgroundColor: primaryColor }}>
                  <Link to="/admin/suppliers">{tx('Open suppliers', 'সাপ্লায়ার')}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {paidAwaitingStock.length > 0 && (
            <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">{tx('Paid — receive to stock', 'পেইড — স্টকে নিন')}</p>
                <p className="text-lg font-bold">{paidAwaitingStock.length}</p>
                <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                  <Link to="/admin/suppliers">{tx('Receive stock', 'স্টক রিসিভ')}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{tx('Counter sales (recent days)', 'কাউন্টার বিক্রয় (সাম্প্রতিক)')}</CardTitle>
          </CardHeader>
          <CardContent>
            {weekChart.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{tx('No counter bills yet.', 'এখনো কাউন্টার বিল নেই।')}</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weekChart} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Area type="monotone" dataKey="sales" stroke={primaryColor} fill="url(#posGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">{tx('Recent counter bills', 'সাম্প্রতিক কাউন্টার বিল')}</CardTitle>
            <Link to="/admin/reports" className="text-xs font-medium flex items-center gap-1" style={{ color: primaryColor }}>
              {t('nav.reports')} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentBills.map(ord => (
                <div key={ord.id} className="px-6 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                    <ScanLine className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ord.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{ord.createdAt} · {ord.paymentMethod}</p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">{fmt(ord.total)}</p>
                </div>
              ))}
              {recentBills.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                  {tx('No counter bills yet.', 'এখনো কাউন্টার বিল নেই।')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base text-amber-700">⚠️ {t('admin.lowStock')}</CardTitle>
            <Link to="/admin/inventory" className="text-xs font-medium" style={{ color: primaryColor }}>
              {t('admin.restock')} →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {lowStockItems.slice(0, 6).map(p => (
                <div key={p.id} className="px-6 py-3 flex items-center gap-3">
                  <ProductThumb src={p.image} alt={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">{p.stock} {tx('left', 'বাকি')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
