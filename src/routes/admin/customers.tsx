import { createFileRoute } from '@tanstack/react-router'
import { Users, Phone, Mail, ShoppingBag, TrendingUp, Search, Eye } from 'lucide-react'
import { useState } from 'react'
import { useAdminStore, fmt } from '@/lib/admin-store'
import { useCustomerStore } from '@/lib/customer-store'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/admin/customers')({
  component: AdminCustomersPage,
})

const SOURCE_LABELS: Record<string, { en: string; bn: string; color: string }> = {
  direct: { en: 'Direct', bn: 'সরাসরি', color: '#6366f1' },
  homepage: { en: 'Homepage', bn: 'হোমপেজ', color: '#22c55e' },
  search: { en: 'Search', bn: 'সার্চ', color: '#f59e0b' },
  referral: { en: 'Referral', bn: 'রেফারেল', color: '#ec4899' },
}

function AdminCustomersPage() {
  const { user } = useAuth()
  const { shops } = useAdminStore()
  const { customers, customerOrders } = useCustomerStore()
  const { lang } = useI18n()
  const [search, setSearch] = useState('')
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [detailCustomer, setDetailCustomer] = useState<string | null>(null)

  const shop = shops.find(s => s.id === user?.shopId)
  const shopCustomers = customers
    .filter(c => c.shopId === user?.shopId)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || (c.email ?? '').toLowerCase().includes(search.toLowerCase()))
    .filter(c => !selectedSource || c.source === selectedSource)

  const totalRevenue = shopCustomers.reduce((s, c) => s + c.totalSpent, 0)
  const avgSpend = shopCustomers.length ? Math.round(totalRevenue / shopCustomers.length) : 0

  const selected = detailCustomer ? customers.find(c => c.id === detailCustomer) : null
  const selectedOrders = detailCustomer ? customerOrders.filter(o => o.customerId === detailCustomer) : []

  const primary = shop?.theme.primaryColor ?? '#6366f1'
  const radiusMap = { sharp: '8px', medium: '16px', rounded: '24px' } as const
  const radius = shop ? radiusMap[shop.theme.borderRadius] : '12px'

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {lang === 'en' ? 'Customers' : 'গ্রাহক'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {lang === 'en' ? 'All registered customers for your shop' : 'আপনার শপের সকল নিবন্ধিত গ্রাহক'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: lang === 'en' ? 'Total Customers' : 'মোট গ্রাহক', value: shopCustomers.length, icon: Users },
          { label: lang === 'en' ? 'Total Revenue' : 'মোট আয়', value: fmt(totalRevenue), icon: TrendingUp },
          { label: lang === 'en' ? 'Avg Spend' : 'গড় খরচ', value: fmt(avgSpend), icon: ShoppingBag },
          { label: lang === 'en' ? 'Repeat Buyers' : 'পুনরায় ক্রেতা', value: shopCustomers.filter(c => c.totalOrders > 1).length, icon: Users },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: primary + '20' }}>
                <stat.icon className="w-4 h-4" style={{ color: primary }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="font-bold text-gray-900 text-sm">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'en' ? 'Search customers...' : 'গ্রাহক খুঁজুন...'}
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSelectedSource(null)} className="text-xs px-3 py-2 rounded-xl border font-medium transition-colors" style={!selectedSource ? { backgroundColor: primary, color: 'white', borderColor: primary } : {}}>
            {lang === 'en' ? 'All' : 'সব'}
          </button>
          {Object.entries(SOURCE_LABELS).map(([key, val]) => (
            <button key={key} onClick={() => setSelectedSource(selectedSource === key ? null : key)} className="text-xs px-3 py-2 rounded-xl border font-medium transition-colors" style={selectedSource === key ? { backgroundColor: val.color, color: 'white', borderColor: val.color } : {}}>
              {lang === 'en' ? val.en : val.bn}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {shopCustomers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{lang === 'en' ? 'No customers found.' : 'কোনো গ্রাহক পাওয়া যায়নি।'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[
                    lang === 'en' ? 'Customer' : 'গ্রাহক',
                    lang === 'en' ? 'Contact' : 'যোগাযোগ',
                    lang === 'en' ? 'Source' : 'উৎস',
                    lang === 'en' ? 'Orders' : 'অর্ডার',
                    lang === 'en' ? 'Total Spent' : 'মোট খরচ',
                    lang === 'en' ? 'Last Active' : 'শেষ সক্রিয়',
                    '',
                  ].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shopCustomers.map(customer => {
                  const src = SOURCE_LABELS[customer.source]
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: primary }}>
                            {customer.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center gap-1 text-xs"><Phone className="w-3 h-3" />{customer.phone}</div>
                        {customer.email && <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><Mail className="w-3 h-3" />{customer.email}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: src.color }}>
                          {lang === 'en' ? src.en : src.bn}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{customer.totalOrders}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: primary }}>{fmt(customer.totalSpent)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{customer.lastActivity}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDetailCustomer(customer.id)} className="text-xs flex items-center gap-1 text-gray-400 hover:text-gray-700">
                          <Eye className="w-3.5 h-3.5" />
                          {lang === 'en' ? 'View' : 'দেখুন'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="px-6 py-5 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: primary }}>
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-500">{selected.phone}</p>
                </div>
              </div>
              <button onClick={() => setDetailCustomer(null)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: lang === 'en' ? 'Source' : 'উৎস', value: lang === 'en' ? SOURCE_LABELS[selected.source].en : SOURCE_LABELS[selected.source].bn },
                  { label: lang === 'en' ? 'Registered' : 'নিবন্ধিত', value: selected.registeredAt },
                  { label: lang === 'en' ? 'Total Orders' : 'মোট অর্ডার', value: selected.totalOrders },
                  { label: lang === 'en' ? 'Total Spent' : 'মোট খরচ', value: fmt(selected.totalSpent) },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="font-semibold text-gray-900 text-sm mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
              {selected.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {selected.email}
                </div>
              )}
              {selectedOrders.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">{lang === 'en' ? 'Order History' : 'অর্ডার ইতিহাস'}</h4>
                  <div className="space-y-2">
                    {selectedOrders.map(order => (
                      <div key={order.id} className="border rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-gray-500">{order.id}</span>
                          <span className="text-xs font-medium" style={{ color: primary }}>{fmt(order.total)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{order.placedAt}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
