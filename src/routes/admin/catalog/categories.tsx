import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Pencil, ChevronDown, ChevronRight, Layers, Tag, Trash2 } from 'lucide-react'
import { useAdminStore, type Category } from '@/lib/admin-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { canEditCatalog } from '@/lib/permissions'
import {
  buildDefaultShopCategoryConfig,
  defaultSubcategoriesForCategory,
  defaultVariantAttributesForCategory,
  subcategoriesForShopCategory,
  variantAttributesForShopCategory,
  type ShopCategoryConfig,
  type VariantAttributeDef,
} from '@/lib/category-config'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/catalog/categories')({
  component: ShopCategoriesPage,
  head: () => ({ meta: [{ title: 'Categories — 1to99' }] }),
})

function kindLabel(cat: Category, lang: 'en' | 'bn') {
  if (cat.kind === 'shop') return lang === 'en' ? 'Your shop' : 'আপনার শপ'
  if (cat.kind === 'platform') return lang === 'en' ? 'Platform' : 'প্ল্যাটফর্ম'
  return lang === 'en' ? 'System' : 'সিস্টেম'
}

function CategoryEditDialog({
  open,
  onOpenChange,
  cat,
  shopId,
  lang,
  canEdit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  cat: Category
  shopId: string
  lang: 'en' | 'bn'
  canEdit: boolean
}) {
  const { getShopCategoryConfig, saveShopCategoryConfig, updateShopCategory } = useAdminStore()
  const stored = getShopCategoryConfig(shopId, cat.id)
  const demoSubs = defaultSubcategoriesForCategory(cat.id)
  const demoVars = defaultVariantAttributesForCategory(cat.id)

  const [name, setName] = useState(cat.name)
  const [nameBn, setNameBn] = useState(cat.nameBn)
  const [icon, setIcon] = useState(cat.icon)
  const [detailsEnabled, setDetailsEnabled] = useState(stored.detailsEnabled)
  const [subcategories, setSubcategories] = useState(stored.subcategories)
  const [variantAttributes, setVariantAttributes] = useState(stored.variantAttributes)

  function resetFromOpen() {
    const cfg = getShopCategoryConfig(shopId, cat.id)
    setName(cat.name)
    setNameBn(cat.nameBn)
    setIcon(cat.icon)
    setDetailsEnabled(cfg.detailsEnabled)
    setSubcategories(cfg.detailsEnabled ? cfg.subcategories : [...demoSubs])
    setVariantAttributes(cfg.detailsEnabled ? cfg.variantAttributes : demoVars.map(a => ({ ...a, options: a.options.map(o => ({ ...o })) })))
  }

  function handleOpenChange(v: boolean) {
    if (v) resetFromOpen()
    onOpenChange(v)
  }

  function loadDemoDefaults() {
    setSubcategories(defaultSubcategoriesForCategory(cat.id))
    setVariantAttributes(defaultVariantAttributesForCategory(cat.id))
  }

  function save() {
    if (!canEdit) return
    if (cat.kind === 'shop') {
      const ok = updateShopCategory(shopId, cat.id, { name, nameBn, icon })
      if (!ok) {
        toast.error(lang === 'en' ? 'Could not update category.' : 'আপডেট হয়নি।')
        return
      }
    }
    const config: ShopCategoryConfig = {
      shopId,
      categoryId: cat.id,
      detailsEnabled,
      subcategories: detailsEnabled ? subcategories : demoSubs,
      variantAttributes: detailsEnabled ? variantAttributes : demoVars,
    }
    saveShopCategoryConfig(config)
    toast.success(lang === 'en' ? 'Category saved' : 'ক্যাটাগরি সংরক্ষিত')
    onOpenChange(false)
  }

  function addSubcategory() {
    const id = `sub_shop_${Date.now().toString(36)}`
    setSubcategories(prev => [
      ...prev,
      { id, name: 'New type', nameBn: 'নতুন', categoryId: cat.id },
    ])
  }

  function updateSub(idx: number, patch: Partial<{ name: string; nameBn: string }>) {
    setSubcategories(prev => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  function removeSub(idx: number) {
    setSubcategories(prev => prev.filter((_, i) => i !== idx))
  }

  function addVariantAxis() {
    setVariantAttributes(prev => [
      ...prev,
      { key: `attr_${Date.now().toString(36)}`, label: 'New attribute', labelBn: 'নতুন', options: [{ value: 'opt1', label: 'Option 1' }] },
    ])
  }

  function updateVariantAxis(idx: number, patch: Partial<VariantAttributeDef>) {
    setVariantAttributes(prev => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)))
  }

  function removeVariantAxis(idx: number) {
    setVariantAttributes(prev => prev.filter((_, i) => i !== idx))
  }

  function updateVariantOption(axisIdx: number, optIdx: number, label: string) {
    setVariantAttributes(prev => prev.map((a, i) => {
      if (i !== axisIdx) return a
      const options = a.options.map((o, j) => (j === optIdx ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, '_') || o.value } : o))
      return { ...a, options }
    }))
  }

  function addVariantOption(axisIdx: number) {
    setVariantAttributes(prev => prev.map((a, i) => {
      if (i !== axisIdx) return a
      return { ...a, options: [...a.options, { value: `v${a.options.length + 1}`, label: 'New option' }] }
    }))
  }

  const activeSubs = detailsEnabled ? subcategories : demoSubs
  const activeVars = detailsEnabled ? variantAttributes : demoVars

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{cat.icon}</span>
            {lang === 'en' ? 'Edit category' : 'ক্যাটাগরি সম্পাদনা'}
          </DialogTitle>
        </DialogHeader>

        {cat.kind === 'shop' && canEdit && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>{lang === 'en' ? 'Name (EN)' : 'নাম (ইংরেজি)'}</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>{lang === 'en' ? 'Name (BN)' : 'নাম (বাংলা)'}</Label><Input value={nameBn} onChange={e => setNameBn(e.target.value)} /></div>
            <div><Label>{lang === 'en' ? 'Icon' : 'আইকন'}</Label><Input value={icon} onChange={e => setIcon(e.target.value)} className="w-24" maxLength={4} /></div>
          </div>
        )}

        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {lang === 'en' ? 'Platform reference (demo — kept)' : 'প্ল্যাটফর্ম রেফারেন্স (ডেমো — থাকবে)'}
          </p>
          <p className="text-sm">
            {demoSubs.length} {lang === 'en' ? 'sub-types' : 'সাব-টাইপ'} · {demoVars.length} {lang === 'en' ? 'variant fields' : 'ভেরিয়েন্ট ফিল্ড'}
          </p>
          <div className="flex flex-wrap gap-1">
            {demoSubs.slice(0, 6).map(s => (
              <Badge key={s.id} variant="secondary" className="text-[10px]">{lang === 'en' ? s.name : s.nameBn}</Badge>
            ))}
            {demoSubs.length > 6 && <Badge variant="outline" className="text-[10px]">+{demoSubs.length - 6}</Badge>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 py-2 border-y">
          <div>
            <p className="text-sm font-medium">{lang === 'en' ? 'Custom details configuration' : 'কাস্টম বিস্তারিত কনফিগ'}</p>
            <p className="text-xs text-muted-foreground">
              {lang === 'en'
                ? 'Off = use platform demo sub-types & variants in POS. On = your editable copy.'
                : 'বন্ধ = POS-এ ডেমো সাব-টাইপ ও ভেরিয়েন্ট। চালু = আপনার সম্পাদনযোগ্য কপি।'}
            </p>
          </div>
          <Switch
            checked={detailsEnabled}
            onCheckedChange={v => {
              setDetailsEnabled(v)
              if (v && subcategories.length === 0) loadDemoDefaults()
            }}
            disabled={!canEdit}
          />
        </div>

        {!detailsEnabled && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {lang === 'en'
              ? 'Details configuration is off. Product forms still use the demo sub-types below until you turn this on and save.'
              : 'কনফিগ বন্ধ। চালু করে সংরক্ষণ না করা পর্যন্ত POS-এ ডেমো সাব-টাইপ ব্যবহার হবে।'}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-1.5"><Layers className="w-4 h-4" /> {lang === 'en' ? 'Sub-types' : 'সাব-টাইপ'}</p>
            {detailsEnabled && canEdit && (
              <Button type="button" variant="outline" size="sm" onClick={addSubcategory}>+ {lang === 'en' ? 'Add' : 'যোগ'}</Button>
            )}
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {(detailsEnabled ? subcategories : activeSubs).map((s, idx) => (
              <div key={s.id} className="flex gap-2 items-center">
                {detailsEnabled && canEdit ? (
                  <>
                    <Input className="h-8 text-sm flex-1" value={s.name} onChange={e => updateSub(idx, { name: e.target.value })} />
                    <Input className="h-8 text-sm flex-1" value={s.nameBn} onChange={e => updateSub(idx, { nameBn: e.target.value })} placeholder="BN" />
                    <button type="button" className="text-muted-foreground hover:text-red-500 p-1" onClick={() => removeSub(idx)}><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">{lang === 'en' ? s.name : s.nameBn}</span>
                )}
              </div>
            ))}
            {activeSubs.length === 0 && (
              <p className="text-xs text-muted-foreground italic">{lang === 'en' ? 'No sub-types for this category yet.' : 'এখনো সাব-টাইপ নেই।'}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-1.5"><Tag className="w-4 h-4" /> {lang === 'en' ? 'Variant attributes' : 'ভেরিয়েন্ট অ্যাট্রিবিউট'}</p>
            {detailsEnabled && canEdit && (
              <Button type="button" variant="outline" size="sm" onClick={addVariantAxis}>+ {lang === 'en' ? 'Add field' : 'ফিল্ড'}</Button>
            )}
          </div>
          {(detailsEnabled ? variantAttributes : activeVars).map((attr, aIdx) => (
            <div key={attr.key + aIdx} className="border rounded-lg p-3 space-y-2 bg-background">
              {detailsEnabled && canEdit ? (
                <div className="flex gap-2">
                  <Input className="h-8 text-sm" value={attr.label} onChange={e => updateVariantAxis(aIdx, { label: e.target.value })} placeholder="Label EN" />
                  <Input className="h-8 text-sm" value={attr.labelBn ?? ''} onChange={e => updateVariantAxis(aIdx, { labelBn: e.target.value })} placeholder="BN" />
                  <button type="button" className="text-muted-foreground hover:text-red-500" onClick={() => removeVariantAxis(aIdx)}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <p className="text-sm font-medium">{lang === 'en' ? attr.label : (attr.labelBn ?? attr.label)}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {attr.options.map((opt, oIdx) => (
                  detailsEnabled && canEdit ? (
                    <Input
                      key={oIdx}
                      className="h-7 w-24 text-xs"
                      value={opt.label}
                      onChange={e => updateVariantOption(aIdx, oIdx, e.target.value)}
                    />
                  ) : (
                    <Badge key={oIdx} variant="outline" className="text-[10px]">{opt.label}</Badge>
                  )
                ))}
                {detailsEnabled && canEdit && (
                  <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => addVariantOption(aIdx)}>+</Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {detailsEnabled && canEdit && (
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={loadDemoDefaults}>
            {lang === 'en' ? 'Reset sub-types & variants from platform demo' : 'ডেমো থেকে রিসেট'}
          </Button>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{lang === 'en' ? 'Cancel' : 'বাতিল'}</Button>
          {canEdit && <Button onClick={save}>{lang === 'en' ? 'Save' : 'সংরক্ষণ'}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ShopCategoriesPage() {
  const { user } = useAuth()
  const {
    products, shops, allCategories, shopCategories, addShopCategory, getShopCategoryConfig,
  } = useAdminStore()
  const { lang } = useI18n()
  const shopId = user?.shopId ?? 'shop_6'
  const shop = shops.find(s => s.id === shopId)
  const allowed = shop?.allowedCategories ?? []
  const usable = shopCategories(shopId, allowed)
  const ownCats = allCategories.filter(c => c.kind === 'shop' && c.shopId === shopId)
  const globalAllowed = usable.filter(c => c.kind !== 'shop')
  const canEdit = canEditCatalog(user?.role ?? 'staff')

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [nameBn, setNameBn] = useState('')
  const [icon, setIcon] = useState('🏷️')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editCat, setEditCat] = useState<Category | null>(null)

  const myProducts = products.filter(p => p.shopId === shopId)

  function productCount(catId: string) {
    return myProducts.filter(p => p.categoryId === catId).length
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleCreate() {
    if (!canEdit) {
      toast.error(lang === 'en' ? 'Only the shop owner can add categories.' : 'শুধু মালিক ক্যাটাগরি যোগ করতে পারেন।')
      return
    }
    const created = addShopCategory(shopId, { name, nameBn: nameBn || name, icon })
    if (!created) {
      toast.error(lang === 'en' ? 'Enter a category name.' : 'ক্যাটাগরির নাম লিখুন।')
      return
    }
    toast.success(lang === 'en' ? 'Category created' : 'ক্যাটাগরি তৈরি হয়েছে')
    setOpen(false)
    setName('')
    setNameBn('')
    setIcon('🏷️')
  }

  function summaryForCategory(cat: Category) {
    const cfg = getShopCategoryConfig(shopId, cat.id)
    const subs = subcategoriesForShopCategory(cfg)
    const vars = variantAttributesForShopCategory(cfg)
    const defaults = buildDefaultShopCategoryConfig(shopId, cat.id)
    return { cfg, subs, vars, demoSubs: defaults.subcategories, demoVars: defaults.variantAttributes }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {lang === 'en' ? 'Categories' : 'ক্যাটাগরি'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'en'
              ? 'Platform demo sub-types and variant fields stay as reference. Turn on custom details only when you want to edit them for your shop.'
              : 'ডেমো সাব-টাইপ ও ভেরিয়েন্ট রেফারেন্স হিসেবে থাকে। শুধু প্রয়োজন হলে কাস্টম কনফিগ চালু করে সম্পাদনা করুন।'}
          </p>
        </div>
        {canEdit && (
          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            {lang === 'en' ? 'New shop category' : 'নতুন শপ ক্যাটাগরি'}
          </Button>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="border shadow-sm">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold">{usable.length}</p>
            <p className="text-xs text-muted-foreground">{lang === 'en' ? 'Usable in POS' : 'POS-এ ব্যবহারযোগ্য'}</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold">{globalAllowed.length}</p>
            <p className="text-xs text-muted-foreground">{lang === 'en' ? 'Platform / system' : 'প্ল্যাটফর্ম / সিস্টেম'}</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold">{ownCats.length}</p>
            <p className="text-xs text-muted-foreground">{lang === 'en' ? 'Your custom' : 'আপনার তৈরি'}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="pb-2 border-b bg-muted/30">
          <CardTitle className="text-sm">{lang === 'en' ? 'All categories you can sell' : 'আপনি যে ক্যাটাগরিতে বিক্রি করতে পারেন'}</CardTitle>
        </CardHeader>
        <div className="divide-y">
          {usable.map(cat => {
            const { cfg, subs, vars, demoSubs, demoVars } = summaryForCategory(cat)
            const isOpen = expanded.has(cat.id)
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                  <button type="button" className="text-muted-foreground shrink-0" onClick={() => toggleExpand(cat.id)}>
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <span className="text-2xl w-8 text-center shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{lang === 'en' ? cat.name : cat.nameBn}</span>
                      <Badge variant="outline" className="text-[10px]">{kindLabel(cat, lang)}</Badge>
                      {cfg.detailsEnabled ? (
                        <Badge className="text-[10px] bg-violet-100 text-violet-800 border-0">{lang === 'en' ? 'Custom config ON' : 'কাস্টম চালু'}</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">{lang === 'en' ? 'Demo reference' : 'ডেমো রেফারেন্স'}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {subs.length} {lang === 'en' ? 'sub-types' : 'সাব-টাইপ'} · {vars.length} {lang === 'en' ? 'variant fields' : 'ভেরিয়েন্ট'} · {productCount(cat.id)} {lang === 'en' ? 'products' : 'পণ্য'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 shrink-0" onClick={() => setEditCat(cat)}>
                    <Pencil className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Edit' : 'সম্পাদনা'}
                  </Button>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 pl-14 space-y-3 bg-muted/15 border-t border-muted/40">
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">{lang === 'en' ? 'Active in POS' : 'POS-এ সক্রিয়'}</p>
                      <div className="flex flex-wrap gap-1">
                        {subs.slice(0, 10).map(s => (
                          <Badge key={s.id} variant="outline" className="text-[10px]">{lang === 'en' ? s.name : s.nameBn}</Badge>
                        ))}
                      </div>
                    </div>
                    {vars.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">{lang === 'en' ? 'Variant fields' : 'ভেরিয়েন্ট'}</p>
                        {vars.map(v => (
                          <div key={v.key} className="mb-2">
                            <p className="text-xs font-medium">{lang === 'en' ? v.label : (v.labelBn ?? v.label)}</p>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {v.options.map(o => (
                                <Badge key={o.value} variant="secondary" className="text-[10px]">{o.label}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!cfg.detailsEnabled && (demoSubs.length > 0 || demoVars.length > 0) && (
                      <p className="text-[11px] text-muted-foreground">
                        {lang === 'en'
                          ? 'Using platform demo configuration. Edit → enable custom details to change sub-types and variants.'
                          : 'প্ল্যাটফর্ম ডেমো কনফিগ চলছে। সম্পাদনা → কাস্টম চালু করে পরিবর্তন করুন।'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{lang === 'en' ? 'New shop category' : 'নতুন শপ ক্যাটাগরি'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{lang === 'en' ? 'Name (English)' : 'নাম (ইংরেজি)'}</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Local Snacks" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{lang === 'en' ? 'Name (Bangla)' : 'নাম (বাংলা)'}</label>
              <Input value={nameBn} onChange={e => setNameBn(e.target.value)} placeholder="যেমন: লোকাল স্ন্যাকস" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{lang === 'en' ? 'Icon (emoji)' : 'আইকন (ইমোজি)'}</label>
              <Input value={icon} onChange={e => setIcon(e.target.value)} maxLength={4} className="w-24" />
            </div>
            <Button className="w-full" onClick={handleCreate}>
              {lang === 'en' ? 'Create' : 'তৈরি করুন'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {editCat && (
        <CategoryEditDialog
          open={!!editCat}
          onOpenChange={v => { if (!v) setEditCat(null) }}
          cat={editCat}
          shopId={shopId}
          lang={lang}
          canEdit={canEdit}
        />
      )}
    </div>
  )
}
