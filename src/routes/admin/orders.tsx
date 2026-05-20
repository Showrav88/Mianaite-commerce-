import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { useAdminStore, fmt, type Order } from '@/lib/admin-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/admin/orders')({
  component: OrdersPage,
  head: () => ({ meta: [{ title: 'Orders — Admin' }] }),
})

const STATUS_LIST: Order['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

function OrdersPage() {
  const { user } = useAuth()
  const { orders, setOrders, shops } = useAdminStore()
  const { t, lang } = useI18n()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | Order['status']>('all')
  const [viewOrder, setViewOrder] = useState<Order | null>(null)

  const shop = shops.find(s => s.id === user?.shopId)
  const primaryColor = shop?.theme.primaryColor ?? '#f97316'

  const myOrders = orders
    .filter(o => o.shopId === user?.shopId)
    .filter(o => tab === 'all' || o.status === tab)
    .filter(o =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search)
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  function updateStatus(id: string, status: Order['status']) {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
  }

  const statusBadge = (status: Order['status']) => {
    const map: Record<Order['status'], string> = {
      pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-cyan-100 text-cyan-700',
      processing: 'bg-blue-100 text-blue-700', shipped: 'bg-violet-100 text-violet-700',
      delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-600',
    }
    const key = `admin.status.${status}` as any
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>{t(key)}</span>
  }

  const statusLabel = (s: Order['status']) => {
    const key = `admin.status.${s}` as any
    return t(key)
  }

  const allMyOrders = orders.filter(o => o.shopId === user?.shopId)
  const counts = STATUS_LIST.reduce((acc, s) => ({ ...acc, [s]: allMyOrders.filter(o => o.status === s).length }), {} as Record<Order['status'], number>)

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.orders')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === 'en' ? `${allMyOrders.length} total orders` : `মোট ${allMyOrders.length}টি অর্ডার`}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', ...STATUS_LIST] as const).map(s => {
          const count = s === 'all' ? allMyOrders.length : counts[s]
          const active = tab === s
          return (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${active ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
              style={active ? { backgroundColor: primaryColor } : {}}
            >
              {s === 'all' ? (lang === 'en' ? 'All' : 'সব') : statusLabel(s)}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25' : 'bg-slate-100'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={lang === 'en' ? 'Search order, name, phone...' : 'অর্ডার, নাম, ফোন খুঁজুন...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Order' : 'অর্ডার'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Customer' : 'গ্রাহক'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Items' : 'আইটেম'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Total' : 'মোট'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Date' : 'তারিখ'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {myOrders.map(ord => (
                <tr key={ord.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono text-xs font-semibold">{ord.orderNumber}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{ord.customerName}</p>
                    <p className="text-xs text-muted-foreground">{ord.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-muted-foreground">{ord.items.length} {lang === 'en' ? 'item(s)' : 'আইটেম'}</p>
                    <p className="text-xs truncate max-w-[120px]">{ord.items.map(i => i.name).join(', ')}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold">{fmt(ord.subtotal)}</td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{ord.createdAt}</td>
                  <td className="px-6 py-4">{statusBadge(ord.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setViewOrder(ord)} className="h-8 w-8 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                      {ord.status !== 'delivered' && ord.status !== 'cancelled' && (
                        <Select value={ord.status} onValueChange={(v: Order['status']) => updateStatus(ord.id, v)}>
                          <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_LIST.filter(s => s !== 'pending').map(s => (
                              <SelectItem key={s} value={s} className="text-xs">{statusLabel(s)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {myOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {lang === 'en' ? 'No orders match your filter.' : 'ফিল্টার অনুযায়ী কোনো অর্ডার পাওয়া যায়নি।'}
            </div>
          )}
        </div>
      </Card>

      {/* Order detail dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">{viewOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {statusBadge(viewOrder.status)}
                <span className="text-xs text-muted-foreground">{viewOrder.createdAt}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">{lang === 'en' ? 'Customer' : 'গ্রাহক'}</p>
                  <p className="font-medium mt-1">{viewOrder.customerName}</p>
                  <p className="text-muted-foreground">{viewOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">{lang === 'en' ? 'Payment' : 'পেমেন্ট'}</p>
                  <p className="mt-1">{lang === 'en' ? 'Cash on Delivery' : 'ক্যাশ অন ডেলিভারি'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">{lang === 'en' ? 'Delivery Address' : 'ডেলিভারি ঠিকানা'}</p>
                <p className="text-sm">{viewOrder.customerAddress}</p>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 border-b"><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{lang === 'en' ? 'Item' : 'আইটেম'}</th><th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Qty</th><th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">{lang === 'en' ? 'Price' : 'দাম'}</th></tr></thead>
                  <tbody className="divide-y">
                    {viewOrder.items.map((item, i) => (
                      <tr key={i}><td className="px-4 py-2.5">{item.name}</td><td className="px-4 py-2.5 text-right">{item.qty}</td><td className="px-4 py-2.5 text-right font-medium">{fmt(item.price * item.qty)}</td></tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="border-t bg-slate-50"><td colSpan={2} className="px-4 py-2.5 font-semibold text-right">{lang === 'en' ? 'Total' : 'মোট'}</td><td className="px-4 py-2.5 font-bold text-right">{fmt(viewOrder.subtotal)}</td></tr></tfoot>
                </table>
              </div>
              {viewOrder.status !== 'delivered' && viewOrder.status !== 'cancelled' && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">{lang === 'en' ? 'Update Status' : 'অবস্থা আপডেট'}</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_LIST.filter(s => s !== viewOrder.status).map(s => (
                      <button
                        key={s}
                        onClick={() => { updateStatus(viewOrder.id, s); setViewOrder({ ...viewOrder, status: s }) }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 hover:border-slate-400 text-slate-600 transition-all"
                      >
                        → {statusLabel(s)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
