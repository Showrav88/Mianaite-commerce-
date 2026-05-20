import { createFileRoute } from '@tanstack/react-router'
import { Users, TrendingUp, ShoppingBag, Search, Eye, Filter } from 'lucide-react'
import { useState } from 'react'
import { useAdminStore, fmt } from '@/lib/admin-store'
import { useCustomerStore } from '@/lib/customer-store'
import { useI18n } from '@/lib/i18n'

export const Route = createFileRoute('/superadmin/customers')({
  component: SuperadminCustomersPage,
})

const SOURCE_LABELS: Record<string, { en: string; bn: string; color: string }> = {
  direct: { en: 'Direct', bn: 'সরাসরি', color: '#6366f1' },
  homepage: { en: 'Homepage', bn: 'হোমপেজ', color: '#22c55e' },
  search: { en: 'Search', bn: 'সার্চ', color: '#f59e0b' },
  referral: { en: 'Referral', bn: 'রেফারেল', color: '#ec4899' },
}

function SuperadminCustomersPage() {
  const { shops } = useAdminStore()
  const { customers, customerOrders } = useCustomerStore()
  const { lang } = useI18n()
  const [search, setSearch] = useState('')
  const [selectedShop, setSelectedShop] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  const filtered = customers
    .filter(c => !selectedShop || c.shopId === selectedShop)
    .filter(c => !selectedSource || c.source === selectedSource)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0)
  const sourceStats = Object.keys(SOURCE_LABELS).map(k => ({ key: k, count: customers.filter(c => c.source === k).length }))

  const selected = detailId ? customers.find(c => c.id === detailId) : null
  const selectedOrders = detailId ? customerOrders.filter(o => o.customerId === detailId) : []
  const selectedShopObj = selected ? shops.find(s => s.id === selected.shopId) : null

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {lang === 'en' ? 'Platform Customers' : 'প্ল্যাটফর্ম গ্রাহক'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {lang === 'en' ? 'All customers across all shops and their acquisition sources' : 'সব শপের গ্রাহক এবং তাদের আগমনের উৎস'}
        </p>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: lang === 'en' ? 'Total Customers' : 'মোট গ্রাহক', value: customers.length, color: '#6366f1' },
          { label: lang === 'en' ? 'Platform Revenue' : 'প্ল্যাটফর্ম আয়', value: fmt(totalRevenue), color: '#22c55e' },
          { label: lang === 'en' ? 'Repeat Buyers' : 'পুনরায় ক্রেতা', value: customers.filter(c => c.totalOrders > 1).length, color: '#f59e0b' },
          { label: lang === 'en' ? 'Total Orders' : 'মোট অর্ডার', value: customerOrders.length, color: '#ec4899' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="font-bold text-xl mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Source breakdown */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">{lang === 'en' ? 'Customer Sources' : 'গ্রাহকের উৎস'}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sourceStats.map(({ key, count }) => {
            const src = SOURCE_LABELS[key]
            const pct = customers.length ? Math.round(count / customers.length * 100) : 0
            return (
              <div key={key} className="rounded-xl p-3 text-center" style={{ backgroundColor: src.color + '15' }}>
                <p className="text-2xl font-bold" style={{ color: src.color }}>{count}</p>
                <p className="text-xs font-medium text-gray-700 mt-1">{lang === 'en' ? src.en : src.bn}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: src.color }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{pct}%</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Per-shop summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        {shops.filter(s => s.status === 'active').map(shop => {
          const shopCusts = customers.filter(c => c.shopId === shop.id)
          return (
            <div
              key={shop.id}
              className="bg-white rounded-2xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-all"
              style={{ borderColor: selectedShop === shop.id ? shop.theme.primaryColor : '#f3f4f6' }}
              onClick={() => setSelectedShop(selectedShop === shop.id ? null : shop.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: shop.theme.primaryColor }}>
                  {shop.name.charAt(0)}
                </div>
                <span className="font-semibold text-gray-900 text-sm">{shop.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-50 rounded-xl py-2">
                  <p className="font-bold text-lg" style={{ color: shop.theme.primaryColor }}>{shopCusts.length}</p>
                  <p className="text-[10px] text-gray-500">{lang === 'en' ? 'Customers' : 'গ্রাহক'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl py-2">
                  <p className="font-bold text-sm text-gray-800">{fmt(shopCusts.reduce((s, c) => s + c.totalSpent, 0))}</p>
                  <p className="text-[10px] text-gray-500">{lang === 'en' ? 'Revenue' : 'আয়'}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'en' ? 'Search customers...' : 'গ্রাহক খুঁজুন...'} className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(SOURCE_LABELS).map(([key, val]) => (
            <button key={key} onClick={() => setSelectedSource(selectedSource === key ? null : key)} className="text-xs px-3 py-2 rounded-xl border font-medium transition-colors" style={selectedSource === key ? { backgroundColor: val.color, color: 'white', borderColor: val.color } : {}}>
              {lang === 'en' ? val.en : val.bn}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{lang === 'en' ? 'No customers found.' : 'কোনো গ্রাহক পাওয়া যায়নি।'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[lang === 'en' ? 'Customer' : 'গ্রাহক', lang === 'en' ? 'Shop' : 'শপ', lang === 'en' ? 'Phone' : 'ফোন', lang === 'en' ? 'Source' : 'উৎস', lang === 'en' ? 'Orders' : 'অর্ডার', lang === 'en' ? 'Spent' : 'খরচ', lang === 'en' ? 'Joined' : 'যোগ দিয়েছেন', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(customer => {
                  const shopObj = shops.find(s => s.id === customer.shopId)
                  const src = SOURCE_LABELS[customer.source]
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: shopObj?.theme.primaryColor ?? '#6366f1' }}>
                            {customer.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {shopObj && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: shopObj.theme.primaryColor }}>
                            {shopObj.name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{customer.phone}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: src.color }}>
                          {lang === 'en' ? src.en : src.bn}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium text-center">{customer.totalOrders}</td>
                      <td className="px-4 py-3 font-bold text-gray-800 text-sm">{fmt(customer.totalSpent)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{customer.registeredAt}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDetailId(customer.id)} className="text-xs flex items-center gap-1 text-gray-400 hover:text-gray-700">
                          <Eye className="w-3.5 h-3.5" />
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

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: selectedShopObj?.theme.primaryColor ?? '#6366f1' }}>
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-500">{selected.phone} • {selectedShopObj?.name}</p>
                </div>
              </div>
              <button onClick={() => setDetailId(null)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: lang === 'en' ? 'Source' : 'উৎস', value: lang === 'en' ? SOURCE_LABELS[selected.source].en : SOURCE_LABELS[selected.source].bn },
                  { label: lang === 'en' ? 'Shop' : 'শপ', value: selectedShopObj?.name ?? '—' },
                  { label: lang === 'en' ? 'Registered' : 'নিবন্ধিত', value: selected.registeredAt },
                  { label: lang === 'en' ? 'Last Active' : 'শেষ সক্রিয়', value: selected.lastActivity },
                  { label: lang === 'en' ? 'Orders' : 'অর্ডার', value: String(selected.totalOrders) },
                  { label: lang === 'en' ? 'Total Spent' : 'মোট খরচ', value: fmt(selected.totalSpent) },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="font-semibold text-gray-900 text-sm mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
              {selectedOrders.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">{lang === 'en' ? 'Order History' : 'অর্ডার ইতিহাস'}</h4>
                  <div className="space-y-2">
                    {selectedOrders.map(order => (
                      <div key={order.id} className="border rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-gray-500">{order.id}</span>
                          <span className="text-xs font-bold text-gray-800">{fmt(order.total)}</span>
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
