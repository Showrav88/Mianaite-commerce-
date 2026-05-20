import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Pencil, Search, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAdminStore, ALL_CATEGORIES, fmt, type Shop } from '@/lib/admin-store'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/superadmin/shops')({
  component: ShopsPage,
  head: () => ({ meta: [{ title: 'Shops — Super Admin' }] }),
})

type FormState = {
  name: string; description: string; ownerName: string; status: Shop['status']
  allowedCategories: string[]
}

const defaultForm: FormState = { name: '', description: '', ownerName: '', status: 'active', allowedCategories: [] }

function ShopsPage() {
  const { shops, setShops } = useAdminStore()
  const { t, lang } = useI18n()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)

  const filtered = shops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ownerName.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setEditId(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(shop: Shop) {
    setEditId(shop.id)
    setForm({ name: shop.name, description: shop.description, ownerName: shop.ownerName, status: shop.status, allowedCategories: [...shop.allowedCategories] })
    setDialogOpen(true)
  }

  function saveShop() {
    if (!form.name.trim()) return
    if (editId) {
      setShops(shops.map(s => s.id === editId ? { ...s, ...form } : s))
    } else {
      const newShop: Shop = {
        id: 'shop_' + Date.now(),
        name: form.name, slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description, ownerId: 'adm_' + Date.now(),
        ownerName: form.ownerName, status: form.status,
        allowedCategories: form.allowedCategories,
        theme: { primaryColor: '#f97316', accentColor: '#ea580c', borderRadius: 'medium', fontFamily: 'Inter' },
        stats: { products: 0, orders: 0, revenue: 0, customers: 0 },
        createdAt: new Date().toISOString().split('T')[0],
      }
      setShops([...shops, newShop])
    }
    setDialogOpen(false)
  }

  function toggleCategory(id: string) {
    setForm(f => ({
      ...f,
      allowedCategories: f.allowedCategories.includes(id)
        ? f.allowedCategories.filter(c => c !== id)
        : [...f.allowedCategories, id],
    }))
  }

  function toggleStatus(shop: Shop) {
    setShops(shops.map(s => s.id === shop.id
      ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
      : s
    ))
  }

  const statusIcon = (s: Shop['status']) => {
    if (s === 'active') return <CheckCircle className="w-4 h-4 text-emerald-500" />
    if (s === 'pending') return <Clock className="w-4 h-4 text-amber-500" />
    return <XCircle className="w-4 h-4 text-red-400" />
  }
  const statusLabel = (s: Shop['status']) => {
    const map = { active: 'bg-emerald-100 text-emerald-700', inactive: 'bg-red-100 text-red-600', pending: 'bg-amber-100 text-amber-700' }
    const labelEn = { active: 'Active', inactive: 'Inactive', pending: 'Pending' }
    const labelBn = { active: 'সক্রিয়', inactive: 'নিষ্ক্রিয়', pending: 'অপেক্ষমান' }
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[s]}`}>{lang === 'en' ? labelEn[s] : labelBn[s]}</span>
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.shops')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{lang === 'en' ? `${shops.length} total shops` : `মোট ${shops.length}টি শপ`}</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> {t('admin.addShop')}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {(['active', 'pending', 'inactive'] as Shop['status'][]).map(s => {
          const count = shops.filter(sh => sh.status === s).length
          const colors = { active: 'text-emerald-600', pending: 'text-amber-600', inactive: 'text-red-500' }
          const bg = { active: 'bg-emerald-50', pending: 'bg-amber-50', inactive: 'bg-red-50' }
          const labels = { active: lang === 'en' ? 'Active' : 'সক্রিয়', pending: lang === 'en' ? 'Pending' : 'অপেক্ষমান', inactive: lang === 'en' ? 'Inactive' : 'নিষ্ক্রিয়' }
          return (
            <Card key={s} className={`border-0 shadow-sm ${bg[s]}`}>
              <CardContent className="pt-5 pb-4">
                <p className={`text-2xl font-bold ${colors[s]}`}>{count}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{labels[s]}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t('admin.search') + '...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-6 py-3 font-medium text-muted-foreground">{t('admin.shopName')}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{t('admin.owner')}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Categories' : 'ক্যাটাগরি'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Products' : 'পণ্য'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Revenue' : 'আয়'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(shop => (
                <tr key={shop.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: shop.theme.primaryColor }}>
                        {shop.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">{shop.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{shop.ownerName}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {shop.allowedCategories.slice(0, 2).map(cid => {
                        const cat = ALL_CATEGORIES.find(c => c.id === cid)
                        return cat ? <span key={cid} className="text-xs bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded">{cat.icon} {lang === 'en' ? cat.name : cat.nameBn}</span> : null
                      })}
                      {shop.allowedCategories.length > 2 && <span className="text-xs text-muted-foreground">+{shop.allowedCategories.length - 2}</span>}
                      {shop.allowedCategories.length === 0 && <span className="text-xs text-muted-foreground">{lang === 'en' ? 'None' : 'কোনো নেই'}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">{shop.stats.products}</td>
                  <td className="px-6 py-4 font-medium">{fmt(shop.stats.revenue)}</td>
                  <td className="px-6 py-4">{statusLabel(shop.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(shop)} className="h-8 w-8 p-0">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => toggleStatus(shop)}
                        className={`h-8 w-8 p-0 ${shop.status === 'active' ? 'text-red-400 hover:text-red-600' : 'text-emerald-500 hover:text-emerald-700'}`}
                        title={shop.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {shop.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {lang === 'en' ? 'No shops found.' : 'কোনো শপ পাওয়া যায়নি।'}
            </div>
          )}
        </div>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? (lang === 'en' ? 'Edit Shop' : 'শপ সম্পাদনা') : t('admin.addShop')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('admin.shopName')}</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Shop name" />
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.owner')}</Label>
                <Input value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} placeholder="Owner name" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{lang === 'en' ? 'Description' : 'বিবরণ'}</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Shop description" />
            </div>
            <div className="space-y-1.5">
              <Label>{lang === 'en' ? 'Status' : 'অবস্থা'}</Label>
              <Select value={form.status} onValueChange={(v: Shop['status']) => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{lang === 'en' ? 'Active' : 'সক্রিয়'}</SelectItem>
                  <SelectItem value="inactive">{lang === 'en' ? 'Inactive' : 'নিষ্ক্রিয়'}</SelectItem>
                  <SelectItem value="pending">{lang === 'en' ? 'Pending' : 'অপেক্ষমান'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{lang === 'en' ? 'Allowed Categories' : 'অনুমোদিত ক্যাটাগরি'}</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {ALL_CATEGORIES.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded p-1.5">
                    <Checkbox
                      checked={form.allowedCategories.includes(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                    />
                    <span className="text-sm">{cat.icon} {lang === 'en' ? cat.name : cat.nameBn}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{form.allowedCategories.length} {lang === 'en' ? 'selected' : 'নির্বাচিত'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('admin.cancel')}</Button>
            <Button onClick={saveShop}>{t('admin.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
