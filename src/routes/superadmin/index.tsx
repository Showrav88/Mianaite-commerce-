import { createFileRoute } from '@tanstack/react-router'
import { TrendingUp, Store, Users, Package, ShoppingCart, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useAdminStore, fmt } from '@/lib/admin-store'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/superadmin/')({
  component: SuperAdminDashboard,
  head: () => ({ meta: [{ title: '1to99 Market — Platform Admin' }] }),
})

const weekRevenue = [
  { day: 'Mon', revenue: 245000 }, { day: 'Tue', revenue: 312000 },
  { day: 'Wed', revenue: 280000 }, { day: 'Thu', revenue: 398000 },
  { day: 'Fri', revenue: 356000 }, { day: 'Sat', revenue: 487000 }, { day: 'Sun', revenue: 421000 },
]

const shopColors = ['#6366f1', '#ec4899', '#22c55e', '#f97316']

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ backgroundColor: color + '20' }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SuperAdminDashboard() {
  const { shops, orders, products, adminUsers } = useAdminStore()
  const { t, lang } = useI18n()
  const { user } = useAuth()

  const activeShops = shops.filter(s => s.status === 'active')
  const activeAdmins = adminUsers.filter(a => a.status === 'active')
  const totalRevenue = shops.reduce((sum, s) => sum + s.stats.revenue, 0)
  const totalProducts = shops.reduce((sum, s) => sum + s.stats.products, 0)
  const pendingShops = shops.filter(s => s.status === 'pending')
  const recentOrders = orders.slice(-5).reverse()

  const pieData = activeShops.map(s => ({ name: s.name, value: s.stats.revenue }))

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700', active: 'bg-emerald-100 text-emerald-700',
      delivered: 'bg-emerald-100 text-emerald-700', processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-violet-100 text-violet-700', cancelled: 'bg-red-100 text-red-700',
      confirmed: 'bg-cyan-100 text-cyan-700',
    }
    const key = `admin.status.${status}` as any
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>{t(key)}</span>
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          1to99 Market — Platform Admin
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === 'en' ? `Welcome back, ${user?.name}. Manage all vendor shops from here.` : `স্বাগতম, ${user?.name}। এখান থেকে সব ভেন্ডর শপ পরিচালনা করুন।`}
        </p>
      </div>

      {/* Pending alert */}
      {pendingShops.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-800 text-sm">
              {lang === 'en' ? `${pendingShops.length} shop(s) awaiting approval` : `${pendingShops.length}টি শপ অনুমোদনের অপেক্ষায়`}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {pendingShops.map(s => s.name).join(', ')}
            </p>
          </div>
          <Link to="/superadmin/shops" className="text-xs font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1">
            {lang === 'en' ? 'Review' : 'পর্যালোচনা'} <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Store} label={t('admin.super.totalShops')} value={String(activeShops.length)} sub={lang === 'en' ? `${pendingShops.length} pending` : `${pendingShops.length}টি অপেক্ষমান`} color="#6366f1" />
        <StatCard icon={Users} label={t('admin.super.totalAdmins')} value={String(activeAdmins.length)} sub={lang === 'en' ? `${adminUsers.length - activeAdmins.length} inactive` : `${adminUsers.length - activeAdmins.length}টি নিষ্ক্রিয়`} color="#ec4899" />
        <StatCard icon={TrendingUp} label={t('admin.super.platformRevenue')} value={fmt(totalRevenue)} sub={lang === 'en' ? 'All-time' : 'সর্বকালীন'} color="#22c55e" />
        <StatCard icon={Package} label={t('admin.super.totalProducts')} value={String(totalProducts)} sub={lang === 'en' ? 'Across all shops' : 'সব শপ মিলিয়ে'} color="#f97316" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{lang === 'en' ? 'Weekly Revenue Trend' : 'সাপ্তাহিক আয়ের প্রবণতা'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weekRevenue} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [fmt(v), lang === 'en' ? 'Revenue' : 'আয়']} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{lang === 'en' ? 'Revenue by Shop' : 'শপ অনুযায়ী আয়'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={shopColors[i % shopColors.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs">{v}</span>} />
                <Tooltip formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Shops table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">{lang === 'en' ? 'All Shops' : 'সমস্ত শপ'}</CardTitle>
          <Link to="/superadmin/shops" className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
            {lang === 'en' ? 'Manage' : 'পরিচালনা'} <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50/50 text-left">
                  <th className="px-6 py-3 font-medium text-muted-foreground">{t('admin.shopName')}</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">{t('admin.owner')}</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Categories' : 'ক্যাটাগরি'}</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Products' : 'পণ্য'}</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Revenue' : 'আয়'}</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shops.map(shop => (
                  <tr key={shop.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: shop.theme.primaryColor }}>
                          {shop.name.charAt(0)}
                        </div>
                        <span className="font-medium">{shop.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{shop.ownerName}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-muted-foreground">{shop.allowedCategories.length} {lang === 'en' ? 'categories' : 'ক্যাটাগরি'}</span>
                    </td>
                    <td className="px-6 py-4">{shop.stats.products}</td>
                    <td className="px-6 py-4 font-medium">{fmt(shop.stats.revenue)}</td>
                    <td className="px-6 py-4">{statusBadge(shop.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent orders */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{lang === 'en' ? 'Recent Orders' : 'সাম্প্রতিক অর্ডার'}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50/50 text-left">
                  <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Order' : 'অর্ডার'}</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Shop' : 'শপ'}</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Customer' : 'গ্রাহক'}</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Total' : 'মোট'}</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map(ord => {
                  const shop = shops.find(s => s.id === ord.shopId)
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-mono text-xs">{ord.orderNumber}</td>
                      <td className="px-6 py-3 text-muted-foreground">{shop?.name}</td>
                      <td className="px-6 py-3">{ord.customerName}</td>
                      <td className="px-6 py-3 font-medium">{fmt(ord.subtotal)}</td>
                      <td className="px-6 py-3">{statusBadge(ord.status)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
