import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Minus, Search, Package, AlertTriangle } from 'lucide-react'
import { useAdminStore, ALL_CATEGORIES, fmt, type AdminProduct } from '@/lib/admin-store'
import { useAuth } from '@/lib/auth'
import { canEditInventory } from '@/lib/permissions'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const Route = createFileRoute('/admin/inventory')({
  component: InventoryPage,
  head: () => ({ meta: [{ title: 'Inventory — Admin' }] }),
})

function InventoryPage() {
  const { user } = useAuth()
  const { products, setProducts, shops } = useAdminStore()
  const { t, lang } = useI18n()
  const [search, setSearch] = useState('')
  const [restockProduct, setRestockProduct] = useState<AdminProduct | null>(null)
  const [restockQty, setRestockQty] = useState('10')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')

  const shop = shops.find(s => s.id === user?.shopId)
  const primaryColor = shop?.theme.primaryColor ?? '#f97316'
  const canEdit = user ? canEditInventory(user.role) : false

  const myProducts = products
    .filter(p => p.shopId === user?.shopId)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    .filter(p => {
      if (filter === 'low') return p.stock > 0 && p.stock <= p.lowStockThreshold
      if (filter === 'out') return p.stock === 0
      return true
    })
    .sort((a, b) => a.stock - b.stock)

  const allMy = products.filter(p => p.shopId === user?.shopId)
  const inStock = allMy.filter(p => p.stock > p.lowStockThreshold).length
  const lowStock = allMy.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length
  const outOfStock = allMy.filter(p => p.stock === 0).length

  function restock() {
    if (!restockProduct) return
    const qty = Number(restockQty)
    if (!qty || qty <= 0) return
    setProducts(products.map(p => p.id === restockProduct.id ? { ...p, stock: p.stock + qty } : p))
    setRestockProduct(null)
    setRestockQty('10')
  }

  function adjustStock(id: string, delta: number) {
    setProducts(products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
  }

  const stockStatus = (p: AdminProduct) => {
    if (p.stock === 0) return { label: t('admin.outOfStock'), color: 'text-red-600', bg: 'bg-red-50 border-red-200' }
    if (p.stock <= p.lowStockThreshold) return { label: t('admin.lowStock'), color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' }
    return { label: lang === 'en' ? 'In Stock' : 'স্টকে আছে', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' }
  }

  const stockPercent = (p: AdminProduct) => {
    const max = Math.max(p.stock, p.lowStockThreshold * 3, 20)
    return Math.min(100, (p.stock / max) * 100)
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.inventory')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === 'en' ? `${allMy.length} products tracked` : `${allMy.length}টি পণ্য ট্র্যাক করা হচ্ছে`}
          {!canEdit && (lang === 'en' ? ' · View only' : ' · শুধু দেখা')}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-emerald-50 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('all')}>
          <CardContent className="pt-5 pb-4">
            <p className="text-2xl font-bold text-emerald-700">{inStock}</p>
            <p className="text-sm text-emerald-600 mt-0.5">{lang === 'en' ? 'In Stock' : 'স্টকে আছে'}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-amber-50 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('low')}>
          <CardContent className="pt-5 pb-4">
            <p className="text-2xl font-bold text-amber-700">{lowStock}</p>
            <p className="text-sm text-amber-600 mt-0.5">{t('admin.lowStock')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-red-50 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('out')}>
          <CardContent className="pt-5 pb-4">
            <p className="text-2xl font-bold text-red-700">{outOfStock}</p>
            <p className="text-sm text-red-600 mt-0.5">{t('admin.outOfStock')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('admin.search') + '...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {(['all', 'low', 'out'] as const).map(f => {
            const labels = { all: lang === 'en' ? 'All' : 'সব', low: t('admin.lowStock'), out: t('admin.outOfStock') }
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${filter === f ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600'}`}
                style={filter === f ? { backgroundColor: primaryColor } : {}}
              >
                {labels[f]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Inventory table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Product' : 'পণ্য'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">SKU</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Category' : 'ক্যাটাগরি'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Stock Level' : 'স্টক লেভেল'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {myProducts.map(p => {
                const cat = ALL_CATEGORIES.find(c => c.id === p.categoryId)
                const status = stockStatus(p)
                return (
                  <tr key={p.id} className={`hover:bg-slate-50/50 ${p.stock === 0 ? 'bg-red-50/30' : p.stock <= p.lowStockThreshold ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          : <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-slate-400" /></div>
                        }
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{lang === 'en' ? `Min: ${p.lowStockThreshold}` : `সর্বনিম্ন: ${p.lowStockThreshold}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{p.sku}</td>
                    <td className="px-6 py-4">
                      {cat && <span className="text-xs">{cat.icon} {lang === 'en' ? cat.name : cat.nameBn}</span>}
                    </td>
                    <td className="px-6 py-4 w-48">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-sm ${status.color}`}>{p.stock}</span>
                          <span className="text-xs text-muted-foreground">{lang === 'en' ? 'units' : 'ইউনিট'}</span>
                        </div>
                        <Progress value={stockPercent(p)} className="h-1.5"
                          style={{ '--progress-foreground': p.stock === 0 ? '#ef4444' : p.stock <= p.lowStockThreshold ? '#f59e0b' : primaryColor } as any}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.color}`}>
                        {p.stock <= p.lowStockThreshold && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {canEdit ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => adjustStock(p.id, -1)} disabled={p.stock === 0} className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40"><Minus className="w-3 h-3" /></button>
                        <span className="w-10 text-center text-sm font-mono font-medium">{p.stock}</span>
                        <button onClick={() => adjustStock(p.id, 1)} className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Plus className="w-3 h-3" /></button>
                        <Button size="sm" onClick={() => setRestockProduct(p)} className="h-7 text-xs ml-1 text-white" style={{ backgroundColor: primaryColor }}>
                          {t('admin.restock')}
                        </Button>
                      </div>
                      ) : (
                        <span className="text-sm font-mono text-muted-foreground">{p.stock}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {myProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {lang === 'en' ? 'No products match your filter.' : 'ফিল্টার অনুযায়ী কোনো পণ্য পাওয়া যায়নি।'}
            </div>
          )}
        </div>
      </Card>

      {/* Restock dialog */}
      <Dialog open={!!restockProduct} onOpenChange={() => setRestockProduct(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('admin.restock')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              {restockProduct?.image && <img src={restockProduct.image} className="w-12 h-12 rounded-lg object-cover" />}
              <div>
                <p className="font-medium text-sm">{restockProduct?.name}</p>
                <p className="text-xs text-muted-foreground">{lang === 'en' ? `Current stock: ${restockProduct?.stock}` : `বর্তমান স্টক: ${restockProduct?.stock}`}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{lang === 'en' ? 'Quantity to Add' : 'যোগ করার পরিমাণ'}</Label>
              <Input
                type="number"
                min={1}
                value={restockQty}
                onChange={e => setRestockQty(e.target.value)}
                className="text-center text-lg font-bold"
              />
              <p className="text-xs text-muted-foreground text-center">
                {lang === 'en'
                  ? `New total: ${(restockProduct?.stock ?? 0) + Number(restockQty)} units`
                  : `নতুন মোট: ${(restockProduct?.stock ?? 0) + Number(restockQty)} ইউনিট`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockProduct(null)}>{t('admin.cancel')}</Button>
            <Button onClick={restock} className="text-white" style={{ backgroundColor: primaryColor }}>
              {t('admin.restock')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
