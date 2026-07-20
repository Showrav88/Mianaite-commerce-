import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAdminStore, type Category } from '@/lib/admin-store'
import { useI18n } from '@/lib/i18n'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export const Route = createFileRoute('/superadmin/categories')({
  component: CategoriesPage,
  head: () => ({ meta: [{ title: 'Category Access — Super Admin' }] }),
})

function categoryKindBadge(cat: Category, lang: 'en' | 'bn') {
  if (cat.kind === 'platform') {
    return (
      <Badge className="text-[10px] bg-violet-100 text-violet-700 border-0">
        {lang === 'en' ? 'Platform' : 'প্ল্যাটফর্ম'}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-[10px]">
      {lang === 'en' ? 'System' : 'সিস্টেম'}
    </Badge>
  )
}

function CategoriesPage() {
  const { shops, setShops, globalCategories, addPlatformCategory } = useAdminStore()
  const { t, lang } = useI18n()
  const globalCats = globalCategories()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [nameBn, setNameBn] = useState('')
  const [icon, setIcon] = useState('📦')

  const activeShops = shops.filter(s => s.status !== 'inactive')

  function toggle(shopId: string, catId: string) {
    setShops(prev => prev.map(s => {
      if (s.id !== shopId) return s
      const has = s.allowedCategories.includes(catId)
      return { ...s, allowedCategories: has ? s.allowedCategories.filter(c => c !== catId) : [...s.allowedCategories, catId] }
    }))
  }

  function handleCreatePlatform() {
    const created = addPlatformCategory({ name, nameBn: nameBn || name, icon })
    if (!created) {
      toast.error(lang === 'en' ? 'Enter a category name.' : 'ক্যাটাগরির নাম লিখুন।')
      return
    }
    toast.success(lang === 'en' ? 'Platform category created — assign it to shops below.' : 'প্ল্যাটফর্ম ক্যাটাগরি তৈরি — নিচে শপগুলোতে চালু করুন।')
    setOpen(false)
    setName('')
    setNameBn('')
    setIcon('📦')
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.categoryAccess')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lang === 'en'
              ? 'System and platform categories control what each shop may sell. Shop owners can still add their own private categories in admin.'
              : 'সিস্টেম ও প্ল্যাটফর্ম ক্যাটাগরি দিয়ে নির্ধারণ হয় কোন শপ কী বিক্রি করতে পারবে। শপ মালিকরা অ্যাডমিনে নিজের ক্যাটাগরি যোগ করতে পারেন।'}
          </p>
        </div>
        <Button className="gap-1.5 shrink-0" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          {lang === 'en' ? 'New platform category' : 'নতুন প্ল্যাটফর্ম ক্যাটাগরি'}
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeShops.map(shop => (
          <Card key={shop.id} className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: shop.theme.primaryColor }}>
                  {shop.name.charAt(0)}
                </div>
                <p className="font-medium text-sm truncate">{shop.name}</p>
              </div>
              <p className="text-2xl font-bold">{shop.allowedCategories.length}</p>
              <p className="text-xs text-muted-foreground">{lang === 'en' ? 'global categories allowed' : 'গ্লোবাল ক্যাটাগরি অনুমোদিত'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base">
            {lang === 'en' ? 'Category × Shop Access Matrix' : 'ক্যাটাগরি × শপ অ্যাক্সেস ম্যাট্রিক্স'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-6 py-3 font-medium text-muted-foreground text-left sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                    {lang === 'en' ? 'Category' : 'ক্যাটাগরি'}
                  </th>
                  {activeShops.map(shop => (
                    <th key={shop.id} className="px-4 py-3 font-medium text-center min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: shop.theme.primaryColor }}>
                          {shop.name.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-600 leading-tight">{shop.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {globalCats.map(cat => {
                  const totalAllowed = activeShops.filter(s => s.allowedCategories.includes(cat.id)).length
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/40">
                      <td className="px-6 py-4 sticky left-0 bg-white hover:bg-slate-50/40 z-10">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{cat.icon}</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm">{lang === 'en' ? cat.name : cat.nameBn}</p>
                              {categoryKindBadge(cat, lang)}
                            </div>
                            <p className="text-[10px] text-muted-foreground">{totalAllowed}/{activeShops.length} {lang === 'en' ? 'shops' : 'শপ'}</p>
                          </div>
                        </div>
                      </td>
                      {activeShops.map(shop => {
                        const allowed = shop.allowedCategories.includes(cat.id)
                        return (
                          <td key={shop.id} className="px-4 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Switch
                                checked={allowed}
                                onCheckedChange={() => toggle(shop.id, cat.id)}
                                className={allowed ? '[&>span]:bg-white' : ''}
                              />
                              <span className={`text-[10px] font-medium ${allowed ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {allowed ? (lang === 'en' ? 'ON' : 'চালু') : (lang === 'en' ? 'OFF' : 'বন্ধ')}
                              </span>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          {lang === 'en' ? 'Per-Shop Breakdown' : 'শপ অনুযায়ী বিভাজন'}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {activeShops.map(shop => (
            <Card key={shop.id} className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: shop.theme.primaryColor }}>
                    {shop.name.charAt(0)}
                  </div>
                  <CardTitle className="text-sm">{shop.name}</CardTitle>
                  <Badge variant="outline" className="ml-auto text-xs">{shop.allowedCategories.length} cats</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-1.5">
                  {globalCats.map(cat => {
                    const allowed = shop.allowedCategories.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggle(shop.id, cat.id)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all text-left ${
                          allowed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span className="truncate">{lang === 'en' ? cat.name : cat.nameBn}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{lang === 'en' ? 'New platform category' : 'নতুন প্ল্যাটফর্ম ক্যাটাগরি'}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            {lang === 'en'
              ? 'Counts as a system-level category — assign which shops may sell it using the matrix above.'
              : 'সিস্টেম-স্তরের ক্যাটাগরি — উপরের ম্যাট্রিক্সে কোন শপ বিক্রি করতে পারবে তা চালু করুন।'}
          </p>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{lang === 'en' ? 'Name (English)' : 'নাম (ইংরেজি)'}</label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{lang === 'en' ? 'Name (Bangla)' : 'নাম (বাংলা)'}</label>
              <Input value={nameBn} onChange={e => setNameBn(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{lang === 'en' ? 'Icon (emoji)' : 'আইকন'}</label>
              <Input value={icon} onChange={e => setIcon(e.target.value)} maxLength={4} className="w-24" />
            </div>
            <Button className="w-full" onClick={handleCreatePlatform}>
              {lang === 'en' ? 'Create' : 'তৈরি করুন'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
