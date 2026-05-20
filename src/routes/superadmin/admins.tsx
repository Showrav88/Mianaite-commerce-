import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Pencil, UserCheck, UserX, Search } from 'lucide-react'
import { useAdminStore, ALL_PERMISSIONS, type AdminUser } from '@/lib/admin-store'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/superadmin/admins')({
  component: AdminsPage,
  head: () => ({ meta: [{ title: 'Admins — Super Admin' }] }),
})

type FormState = {
  name: string; email: string; phone: string; shopId: string; status: AdminUser['status']; permissions: string[]
}

const defaultForm: FormState = { name: '', email: '', phone: '', shopId: '', status: 'active', permissions: [] }

function AdminsPage() {
  const { adminUsers, setAdminUsers, shops } = useAdminStore()
  const { t, lang } = useI18n()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)

  const filtered = adminUsers.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  function openInvite() {
    setEditId(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(admin: AdminUser) {
    setEditId(admin.id)
    setForm({ name: admin.name, email: admin.email, phone: admin.phone ?? '', shopId: admin.shopId ?? '', status: admin.status, permissions: [...admin.permissions] })
    setDialogOpen(true)
  }

  function saveAdmin() {
    if (!form.name.trim() || !form.email.trim()) return
    const shop = shops.find(s => s.id === form.shopId)
    if (editId) {
      setAdminUsers(adminUsers.map(a => a.id === editId
        ? { ...a, ...form, shopName: shop?.name, role: 'shop_admin' as const }
        : a
      ))
    } else {
      const newAdmin: AdminUser = {
        id: 'adm_' + Date.now(), ...form,
        role: 'shop_admin', shopName: shop?.name,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setAdminUsers([...adminUsers, newAdmin])
    }
    setDialogOpen(false)
  }

  function togglePerm(key: string) {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key],
    }))
  }

  function toggleStatus(admin: AdminUser) {
    setAdminUsers(adminUsers.map(a => a.id === admin.id
      ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' }
      : a
    ))
  }

  const statusLabel = (s: AdminUser['status']) => {
    const map = { active: 'bg-emerald-100 text-emerald-700', inactive: 'bg-red-100 text-red-600', pending: 'bg-amber-100 text-amber-700' }
    const labelEn = { active: 'Active', inactive: 'Inactive', pending: 'Pending' }
    const labelBn = { active: 'সক্রিয়', inactive: 'নিষ্ক্রিয়', pending: 'অপেক্ষমান' }
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[s]}`}>{lang === 'en' ? labelEn[s] : labelBn[s]}</span>
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.admins')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lang === 'en' ? `${adminUsers.length} admin users` : `${adminUsers.length}জন অ্যাডমিন`}
          </p>
        </div>
        <Button onClick={openInvite} className="gap-2">
          <Plus className="w-4 h-4" /> {t('admin.inviteAdmin')}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t('admin.search') + '...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Cards grid on mobile, table on desktop */}
      <div className="md:hidden space-y-3">
        {filtered.map(admin => (
          <Card key={admin.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-violet-100 text-violet-700 font-semibold text-sm">
                    {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{admin.name}</p>
                    {statusLabel(admin.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                  {admin.shopName && <p className="text-xs text-violet-600 mt-1">{admin.shopName}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {admin.permissions.slice(0, 3).map(p => (
                      <span key={p} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{p.replace('_', ' ')}</span>
                    ))}
                    {admin.permissions.length > 3 && <span className="text-[10px] text-muted-foreground">+{admin.permissions.length - 3}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(admin)} className="h-8 w-8 p-0"><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleStatus(admin)} className={`h-8 w-8 p-0 ${admin.status === 'active' ? 'text-red-400' : 'text-emerald-500'}`}>
                    {admin.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table for desktop */}
      <Card className="hidden md:block border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-6 py-3 font-medium text-muted-foreground">{t('admin.name')}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{t('admin.email')}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Shop' : 'শপ'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{t('admin.permissions')}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Last Login' : 'শেষ লগইন'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(admin => (
                <tr key={admin.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-semibold">
                          {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{admin.email}</td>
                  <td className="px-6 py-4">
                    {admin.shopName
                      ? <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">{admin.shopName}</span>
                      : <span className="text-muted-foreground text-xs">{lang === 'en' ? 'Unassigned' : 'অ-নির্ধারিত'}</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {admin.permissions.length === 0
                        ? <span className="text-xs text-muted-foreground">{lang === 'en' ? 'None' : 'কোনো নেই'}</span>
                        : admin.permissions.slice(0, 2).map(p => (
                          <span key={p} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{p.replace('_', ' ')}</span>
                        ))
                      }
                      {admin.permissions.length > 2 && <span className="text-[10px] text-muted-foreground">+{admin.permissions.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{admin.lastLogin ?? '—'}</td>
                  <td className="px-6 py-4">{statusLabel(admin.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(admin)} className="h-8 w-8 p-0"><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleStatus(admin)} className={`h-8 w-8 p-0 ${admin.status === 'active' ? 'text-red-400 hover:text-red-600' : 'text-emerald-500 hover:text-emerald-700'}`}>
                        {admin.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? (lang === 'en' ? 'Edit Admin' : 'অ্যাডমিন সম্পাদনা') : t('admin.inviteAdmin')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('admin.name')}</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.phone')}</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="017..." />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('admin.email')}</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{lang === 'en' ? 'Assign to Shop' : 'শপে নিয়োগ দিন'}</Label>
                <Select value={form.shopId} onValueChange={v => setForm(f => ({ ...f, shopId: v }))}>
                  <SelectTrigger><SelectValue placeholder={lang === 'en' ? 'Select shop' : 'শপ নির্বাচন'} /></SelectTrigger>
                  <SelectContent>
                    {shops.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{lang === 'en' ? 'Status' : 'অবস্থা'}</Label>
                <Select value={form.status} onValueChange={(v: AdminUser['status']) => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{lang === 'en' ? 'Active' : 'সক্রিয়'}</SelectItem>
                    <SelectItem value="pending">{lang === 'en' ? 'Pending' : 'অপেক্ষমান'}</SelectItem>
                    <SelectItem value="inactive">{lang === 'en' ? 'Inactive' : 'নিষ্ক্রিয়'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.permissions')}</Label>
              <div className="grid grid-cols-1 gap-2 border rounded-lg p-3 max-h-44 overflow-y-auto">
                {ALL_PERMISSIONS.map(p => (
                  <label key={p.key} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded p-1">
                    <Checkbox checked={form.permissions.includes(p.key)} onCheckedChange={() => togglePerm(p.key)} />
                    <span className="text-sm">{lang === 'en' ? p.label : p.labelBn}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('admin.cancel')}</Button>
            <Button onClick={saveAdmin}>{editId ? t('admin.save') : (lang === 'en' ? 'Send Invite' : 'আমন্ত্রণ পাঠান')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
