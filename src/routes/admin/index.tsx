import { createFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCart, Package, AlertTriangle, TrendingUp, ArrowUpRight, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAdminStore, ALL_CATEGORIES, fmt } from '@/lib/admin-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: 'Admin Dashboard — AITeShops' }] }),
})

const weekOrders = [
  { day: 'Mon', orders: 12 }, { day: 'Tue', orders: 19 },
  { day: 'Wed', orders: 8 }, { day: 'Thu', orders: 24 },
  { day: 'Fri', orders: 18 }, { day: 'Sat', orders: 31 }, { day: 'Sun', orders: 27 },
]

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
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
  const { orders, products, shops } = useAdminStore()
  const { t, lang } = useI18n()

  const shop = shops.find(s => s.id === user?.shopId)
  const primaryColor = shop?.theme.primaryColor ?? '#f97316'

  const myOrders = orders.filter(o => o.shopId === user?.shopId)
  const myProducts = products.filter(p => p.shopId === user?.shopId)
  const pendingOrders = myOrders.filter(o => o.status === 'pending')
  const lowStockItems = myProducts.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0)
  const outOfStock = myProducts.filter(p => p.stock === 0)
  const monthRevenue = myOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.subtotal, 0)
  const todayOrders = myOrders.filter(o => o.createdAt === '2026-05-19')

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-cyan-100 text-cyan-700',
      processing: 'bg-blue-100 text-blue-700', shipped: 'bg-violet-100 text-violet-700',
      delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-600',
    }
    const key = `admin.status.${status}` as any
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{t(key)}</span>
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('admin.welcome')}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === 'en' ? `Managing ${shop?.name ?? user?.shopName}` : `${shop?.name ?? user?.shopName} পরিচালনা করছেন`}
        </p>
      </div>

      {/* Alerts */}
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
            {lang === 'en' ? 'Restock' : 'পুনঃস্টক'} <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label={t('admin.todayOrders')} value={String(todayOrders.length)} sub={`${pendingOrders.length} ${lang === 'en' ? 'pending' : 'অপেক্ষমান'}`} color={primaryColor} />
        <StatCard icon={TrendingUp} label={t('admin.revenue')} value={fmt(monthRevenue)} sub={lang === 'en' ? 'All-time' : 'সর্বকালীন'} color="#22c55e" />
        <StatCard icon={Package} label={t('admin.products')} value={String(myProducts.length)} sub={`${myProducts.filter(p => p.status === 'active').length} ${lang === 'en' ? 'active' : 'সক্রিয়'}`} color="#6366f1" />
        <StatCard icon={AlertTriangle} label={t('admin.lowStock')} value={String(lowStockItems.length + outOfStock.length)} sub={`${outOfStock.length} ${lang === 'en' ? 'out of stock' : 'স্টক শেষ'}`} color="#f97316" />
      </div>

      {/* Allowed categories — updates live when super admin changes access */}
      {shop && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{lang === 'en' ? 'Your Allowed Categories' : 'আপনার অনুমোদিত ক্যাটাগরি'}</CardTitle>
          </CardHeader>
          <CardContent>
            {shop.allowedCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {lang === 'en' ? 'No categories assigned yet. Contact your super admin.' : 'এখনো কোনো ক্যাটাগরি নির্ধারিত হয়নি। সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {shop.allowedCategories.map(cid => {
                  const cat = ALL_CATEGORIES.find(c => c.id === cid)
                  return cat ? (
                    <span key={cid} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: primaryColor }}>
                      {cat.icon} {lang === 'en' ? cat.name : cat.nameBn}
                    </span>
                  ) : null
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{lang === 'en' ? 'Orders This Week' : 'এই সপ্তাহের অর্ডার'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weekOrders} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="orders" stroke={primaryColor} fill="url(#ordGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">{lang === 'en' ? 'Recent Orders' : 'সাম্প্রতিক অর্ডার'}</CardTitle>
            <Link to="/admin/orders" className="text-xs font-medium flex items-center gap-1" style={{ color: primaryColor }}>
              {lang === 'en' ? 'View all' : 'সব দেখুন'} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {myOrders.slice(0, 4).map(ord => (
                <div key={ord.id} className="px-6 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ord.customerName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{ord.orderNumber}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{fmt(ord.subtotal)}</p>
                    {statusBadge(ord.status)}
                  </div>
                </div>
              ))}
              {myOrders.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                  {lang === 'en' ? 'No orders yet.' : 'এখনো কোনো অর্ডার নেই।'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low stock table */}
      {lowStockItems.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base text-amber-700">⚠️ {t('admin.lowStock')} {lang === 'en' ? 'Alerts' : 'সতর্কতা'}</CardTitle>
            <Link to="/admin/inventory" className="text-xs font-medium" style={{ color: primaryColor }}>
              {t('admin.restock')} →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {lowStockItems.map(p => (
                <div key={p.id} className="px-6 py-3 flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">{p.stock} {lang === 'en' ? 'left' : 'বাকি'}</p>
                    <p className="text-xs text-muted-foreground">{lang === 'en' ? `Min: ${p.lowStockThreshold}` : `সর্বনিম্ন: ${p.lowStockThreshold}`}</p>
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
