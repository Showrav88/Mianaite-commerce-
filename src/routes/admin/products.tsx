import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import {
  Plus, Pencil, Trash2, Search, Package, QrCode,
  Video, X, Upload, ScanLine, ExternalLink, ImagePlus, Tag,
  TrendingUp, Percent, DollarSign, Cloud,
} from 'lucide-react'
import { uploadToCloudinary, cloudinaryConfigured } from '@/lib/cloudinary'
import { openProductForSale, resolveProductFromScan, shopProductPageUrl } from '@/lib/shop-url'
import {
  useAdminStore, ALL_CATEGORIES, SUBCATEGORIES_BY_CATEGORY,
  fmt, effectivePrice, profitAmount, discountBadgeText,
  type AdminProduct,
} from '@/lib/admin-store'
import {
  extractYouTubeId,
  isFacebookVideoUrl,
  facebookVideoEmbedSrc,
} from '@/lib/social-embed'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/admin/products')({
  component: ProductsPage,
  head: () => ({ meta: [{ title: 'Products — Admin' }] }),
})

type DiscountType = 'none' | 'percent' | 'amount'

type FormState = {
  name: string
  sku: string
  description: string
  categoryId: string
  subcategoryId: string
  costPrice: string
  price: string
  discountType: DiscountType
  discountValue: string
  stock: string
  lowStockThreshold: string
  images: string[]
  youtubeUrl: string
  facebookVideoUrl: string
  tags: string
  status: AdminProduct['status']
}

const defaultForm: FormState = {
  name: '', sku: '', description: '', categoryId: '', subcategoryId: '',
  costPrice: '', price: '', discountType: 'none', discountValue: '',
  stock: '', lowStockThreshold: '5',
  images: [], youtubeUrl: '', facebookVideoUrl: '', tags: '', status: 'active',
}

function calcEffective(price: string, dType: DiscountType, dVal: string): number {
  const p = Number(price) || 0
  if (dType === 'none' || !dVal) return p
  if (dType === 'percent') return Math.round(p * (1 - Number(dVal) / 100))
  return Math.max(0, p - Number(dVal))
}

function ImageUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlBox, setShowUrlBox] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''

    if (cloudinaryConfigured) {
      setUploading(true)
      const urls: string[] = []
      for (const file of files) {
        const url = await uploadToCloudinary(file)
        if (url) urls.push(url)
      }
      setUploading(false)
      if (urls.length) { onChange([...images, ...urls].slice(0, 6)); return }
    }

    // fallback: local base64
    let current = [...images]
    let pending = files.length
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        if (ev.target?.result) current = [...current, ev.target.result as string].slice(0, 6)
        pending--
        if (pending === 0) onChange(current)
      }
      reader.readAsDataURL(file)
    })
  }

  function addUrl() {
    const url = urlInput.trim()
    if (url) { onChange([...images, url].slice(0, 6)); setUrlInput(''); setShowUrlBox(false) }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-white group">
            <img src={img} alt="" className="w-full h-full object-contain" />
            {idx === 0 && (
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">Main</span>
            )}
            <button
              type="button"
              onClick={() => onChange(images.filter((_, i) => i !== idx))}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {images.length < 6 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-primary flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary transition-colors disabled:opacity-50"
          >
            {uploading ? <Cloud className="w-5 h-5 animate-pulse text-emerald-500" /> : <Upload className="w-5 h-5" />}
            <span className="text-[10px]">{uploading ? 'Uploading…' : cloudinaryConfigured ? 'Upload' : 'Upload'}</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      <div className="flex flex-wrap items-center gap-3">
        {cloudinaryConfigured && (
          <span className="text-[10px] text-emerald-600 flex items-center gap-1">
            <Cloud className="w-3 h-3" /> Cloud upload active
          </span>
        )}
        <button
          type="button"
          onClick={() => setShowUrlBox(v => !v)}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <ImagePlus className="w-3 h-3" /> Add image URL
        </button>
      </div>
      {showUrlBox && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="text-sm"
            onKeyDown={e => e.key === 'Enter' && addUrl()}
          />
          <Button type="button" size="sm" onClick={addUrl}>Add</Button>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">Up to 6 images. First image is the main product photo.</p>
    </div>
  )
}

function YoutubeUrlField({ value, onChange, lang }: { value: string; onChange: (v: string) => void; lang: 'en' | 'bn' }) {
  const ytId = extractYouTubeId(value)
  return (
    <div className="space-y-2">
      <div className="relative">
        <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pl-9 pr-9"
          placeholder={lang === 'en' ? 'https://www.youtube.com/watch?v=...' : 'YouTube লিংক...'}
        />
        {value && (
          <a href={value} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2">
            <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </a>
        )}
      </div>
      {ytId && (
        <div className="relative rounded-lg overflow-hidden aspect-video w-full border">
          <iframe
            title="YouTube preview"
            src={`https://www.youtube.com/embed/${ytId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">
        {lang === 'en' ? 'Shown on your shop product page. Use a public YouTube link.' : 'শপের পণ্য পেজে দেখাবে। পাবলিক YouTube লিংক দিন।'}
      </p>
    </div>
  )
}

function FacebookUrlField({ value, onChange, lang }: { value: string; onChange: (v: string) => void; lang: 'en' | 'bn' }) {
  const isFb = isFacebookVideoUrl(value)
  const embedSrc = isFb ? facebookVideoEmbedSrc(value) : null
  return (
    <div className="space-y-2">
      <div className="relative">
        <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pl-9 pr-9"
          placeholder={lang === 'en' ? 'https://www.facebook.com/.../videos/...' : 'Facebook ভিডিও লিংক...'}
        />
        {value && (
          <a href={value} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2">
            <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </a>
        )}
      </div>
      {embedSrc && (
        <div className="rounded-lg overflow-hidden border aspect-video w-full bg-[#f0f2f5] min-h-[200px]">
          <iframe
            title="Facebook preview"
            src={embedSrc}
            className="w-full h-full min-h-[200px] border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            scrolling="no"
          />
        </div>
      )}
      {value && !isFb && (
        <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
          {lang === 'en' ? 'Paste a Facebook video or fb.watch link.' : 'Facebook ভিডিও বা fb.watch লিংক দিন।'}
        </p>
      )}
      <p className="text-[11px] text-muted-foreground">
        {lang === 'en' ? 'Public Facebook videos only. Customers can switch between YouTube and Facebook on the product page.' : 'পাবলিক Facebook ভিডিও। গ্রাহক পণ্য পেজে YouTube ও Facebook বেছে নিতে পারবেন।'}
      </p>
    </div>
  )
}

function QRModal({
  product,
  shopSlug,
  primaryColor,
  onClose,
  lang,
}: {
  product: AdminProduct | null
  shopSlug: string | undefined
  primaryColor: string
  onClose: () => void
  lang: 'en' | 'bn'
}) {
  if (!product) return null

  const canSell = Boolean(shopSlug)
  const qrTarget = canSell ? shopProductPageUrl(shopSlug!, product.id) : null
  const qrImageUrl = qrTarget
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrTarget)}`
    : null

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <DialogTitle>{lang === 'en' ? 'Sale QR' : 'বিক্রয় কিউআর'}</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          {!canSell ? (
            <p className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
              {lang === 'en' ? 'Shop not found.' : 'শপ পাওয়া যায়নি।'}
            </p>
          ) : (
            <>
              <div className="border rounded-xl p-4 bg-white inline-block">
                <img src={qrImageUrl!} alt={`Sale QR ${product.name}`} className="w-44 h-44 mx-auto" />
              </div>
              <div>
                <p className="font-semibold text-sm">{product.name}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">{product.sku}</p>
              </div>
              <p className="text-xs text-muted-foreground px-2">
                {lang === 'en'
                  ? 'Print for your stall. Scan opens the product page — buyer orders from there.'
                  : 'স্টলে প্রিন্ট করুন। স্ক্যান করলে পণ্য পেজ খুলবে — ক্রেতা সেখান থেকে অর্ডার করবে।'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  size="sm"
                  className="gap-1.5 text-white"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => {
                    openProductForSale(shopSlug!, product.id)
                    onClose()
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Open for sale' : 'বিক্রয়ের জন্য খুলুন'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(qrImageUrl!, '_blank')}>
                  {lang === 'en' ? 'Download QR' : 'কিউআর ডাউনলোড'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  {lang === 'en' ? 'Print' : 'প্রিন্ট'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ProductsPage() {
  const { user } = useAuth()
  const { products, setProducts, shops } = useAdminStore()
  const { t, lang } = useI18n()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [qrProduct, setQrProduct] = useState<AdminProduct | null>(null)
  const [scanMode, setScanMode] = useState(false)
  const [scanBuffer, setScanBuffer] = useState('')
  const scanRef = useRef<HTMLInputElement>(null)

  const shop = shops.find(s => s.id === user?.shopId)
  const primaryColor = shop?.theme.primaryColor ?? '#f97316'
  const allowedCats = ALL_CATEGORIES.filter(c => shop?.allowedCategories.includes(c.id))
  const subcats = form.categoryId ? (SUBCATEGORIES_BY_CATEGORY[form.categoryId] ?? []) : []

  // Live pricing calc in form
  const sellPrice = Number(form.price) || 0
  const costPrice = Number(form.costPrice) || 0
  const effPrice = calcEffective(form.price, form.discountType, form.discountValue)
  const profit = costPrice > 0 ? effPrice - costPrice : null
  const marginPct = costPrice > 0 && effPrice > 0 ? Math.round((profit! / effPrice) * 100) : null

  const myProducts = products
    .filter(p => p.shopId === user?.shopId)
    .filter(p => catFilter === 'all' || p.categoryId === catFilter)
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags ?? []).some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    )

  function openAdd() { setEditId(null); setForm(defaultForm); setDialogOpen(true) }
  function openEdit(p: AdminProduct) {
    setEditId(p.id)
    setForm({
      name: p.name, sku: p.sku, description: p.description,
      categoryId: p.categoryId, subcategoryId: p.subcategoryId ?? '',
      costPrice: p.costPrice ? String(p.costPrice) : '',
      price: String(p.price),
      discountType: (p.discountType as DiscountType) ?? 'none',
      discountValue: p.discountValue ? String(p.discountValue) : '',
      stock: String(p.stock), lowStockThreshold: String(p.lowStockThreshold),
      images: p.images?.length ? p.images : (p.image ? [p.image] : []),
      youtubeUrl: p.youtubeUrl ?? (p.videoUrl && extractYouTubeId(p.videoUrl) ? p.videoUrl : ''),
      facebookVideoUrl:
        p.facebookVideoUrl ??
        (p.videoUrl && isFacebookVideoUrl(p.videoUrl) && !extractYouTubeId(p.videoUrl) ? p.videoUrl : ''),
      tags: (p.tags ?? []).join(', '),
      status: p.status,
    })
    setDialogOpen(true)
  }

  function saveProduct() {
    if (!form.name.trim() || !form.categoryId) return
    const firstImage = form.images[0] ?? ''
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const data: Omit<AdminProduct, 'id' | 'sold' | 'videoUrl'> = {
      name: form.name, sku: form.sku, description: form.description,
      categoryId: form.categoryId, subcategoryId: form.subcategoryId || undefined,
      costPrice: form.costPrice ? Number(form.costPrice) : undefined,
      price: Number(form.price),
      discountType: form.discountType !== 'none' ? form.discountType : undefined,
      discountValue: form.discountType !== 'none' && form.discountValue ? Number(form.discountValue) : undefined,
      stock: Number(form.stock), lowStockThreshold: Number(form.lowStockThreshold),
      image: firstImage, images: form.images,
      youtubeUrl: form.youtubeUrl.trim() || undefined,
      facebookVideoUrl: form.facebookVideoUrl.trim() || undefined,
      tags: tags.length ? tags : undefined,
      status: form.status, shopId: user!.shopId!,
    }
    if (editId) {
      setProducts(products.map(p => {
        if (p.id !== editId) return p
        const { videoUrl: _legacy, ...rest } = p
        return { ...rest, ...data }
      }))
    } else {
      setProducts([...products, { ...data, id: 'p_' + Date.now(), sold: 0 }])
    }
    setDialogOpen(false)
  }

  function deleteProduct(id: string) { setProducts(products.filter(p => p.id !== id)); setDeleteId(null) }

  function activateScan() {
    setScanMode(true)
    setScanBuffer('')
    setTimeout(() => scanRef.current?.focus(), 50)
  }

  function handleScanSubmit(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed || !shop?.slug) return

    const resolved = resolveProductFromScan(trimmed, products)

    if (resolved) {
      openProductForSale(shop.slug, resolved.id)
      setScanBuffer('')
      setScanMode(false)
      return
    }

    setSearch(trimmed)
    setScanBuffer('')
    setScanMode(false)
  }

  const stockBadge = (p: AdminProduct) => {
    if (p.stock === 0) return <span className="text-xs font-medium text-red-600">{t('admin.outOfStock')}</span>
    if (p.stock <= p.lowStockThreshold) return <span className="text-xs font-medium text-amber-600">{t('admin.lowStock')} ({p.stock})</span>
    return <span className="text-xs font-medium text-emerald-600">{p.stock} {lang === 'en' ? 'in stock' : 'স্টকে'}</span>
  }

  const statusBadge = (s: AdminProduct['status']) => {
    const map = { active: 'bg-emerald-100 text-emerald-700', draft: 'bg-slate-100 text-slate-600', inactive: 'bg-red-100 text-red-600' }
    const label = { active: lang === 'en' ? 'Active' : 'সক্রিয়', draft: lang === 'en' ? 'Draft' : 'ড্রাফট', inactive: lang === 'en' ? 'Inactive' : 'নিষ্ক্রিয়' }
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>
  }

  const displayImg = (p: AdminProduct) => (p.images?.[0] ?? p.image) || ''

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.products')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lang === 'en'
              ? `${myProducts.length} products — ${allowedCats.length} categories allowed`
              : `${myProducts.length}টি পণ্য — ${allowedCats.length}টি ক্যাটাগরি অনুমোদিত`}
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2 text-white" style={{ backgroundColor: primaryColor }}>
          <Plus className="w-4 h-4" /> {t('admin.addProduct')}
        </Button>
      </div>

      {/* Search + Scanner */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={lang === 'en' ? 'Search name, SKU, tags...' : 'নাম, SKU, ট্যাগ খুঁজুন...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {scanMode ? (
          <div className="relative flex-1 max-w-xs">
            <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-pulse" />
            <Input
              ref={scanRef}
              value={scanBuffer}
              onChange={e => setScanBuffer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScanSubmit(scanBuffer)}
              onBlur={() => setScanMode(false)}
              placeholder={lang === 'en' ? 'Scan sale QR or SKU...' : 'সেল কিউআর বা SKU...'}
              className="pl-9 border-primary ring-1 ring-primary"
              autoComplete="off"
            />
            <button onClick={() => setScanMode(false)} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <Button variant="outline" onClick={activateScan} className="gap-2 shrink-0">
            <ScanLine className="w-4 h-4" />
            {lang === 'en' ? 'Scan' : 'স্ক্যান'}
          </Button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCatFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${catFilter === 'all' ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
          style={catFilter === 'all' ? { backgroundColor: primaryColor } : {}}
        >
          {lang === 'en' ? 'All' : 'সব'}
        </button>
        {allowedCats.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCatFilter(catFilter === cat.id ? 'all' : cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${catFilter === cat.id ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
            style={catFilter === cat.id ? { backgroundColor: primaryColor } : {}}
          >
            {cat.icon} {lang === 'en' ? cat.name : cat.nameBn}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Product' : 'পণ্য'}</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">SKU</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Category' : 'ক্যাটাগরি'}</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Price / Profit' : 'মূল্য / মুনাফা'}</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">{t('admin.stock')}</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {myProducts.map(p => {
                const cat = ALL_CATEGORIES.find(c => c.id === p.categoryId)
                const subcat = p.subcategoryId
                  ? (SUBCATEGORIES_BY_CATEGORY[p.categoryId] ?? []).find(s => s.id === p.subcategoryId)
                  : null
                const img = displayImg(p)
                const ep = effectivePrice(p)
                const pa = profitAmount(p)
                const badge = discountBadgeText(p, lang)
                const hasDiscount = ep < p.price
                const hiddenFromStore = !shop?.allowedCategories.includes(p.categoryId)
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          {img
                            ? <img src={img} alt={p.name} className="w-11 h-11 rounded-lg object-contain bg-white border" />
                            : <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-slate-400" /></div>
                          }
                          {badge && (
                            <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-red-500 text-white px-1 py-0.5 rounded font-bold leading-none">
                              {p.discountType === 'percent' ? `${p.discountValue}%` : 'OFF'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[140px]">{p.name}</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {(p.tags ?? []).slice(0, 2).map(tag => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {cat && (
                          <span className={`text-xs px-2 py-0.5 rounded-full block w-fit ${hiddenFromStore ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'}`}>
                            {cat.icon} {lang === 'en' ? cat.name : cat.nameBn}
                            </span>
                        )}
                        {subcat && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full block w-fit">{lang === 'en' ? subcat.name : subcat.nameBn}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        {hasDiscount ? (
                          <>
                            <p className="font-bold text-sm" style={{ color: primaryColor }}>{fmt(ep)}</p>
                            <p className="text-xs text-muted-foreground line-through">{fmt(p.price)}</p>
                            <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">{badge}</span>
                          </>
                        ) : (
                          <p className="font-semibold">{fmt(p.price)}</p>
                        )}
                        {p.costPrice && (
                          <p className={`text-[11px] mt-0.5 flex items-center gap-0.5 ${pa >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            <TrendingUp className="w-2.5 h-2.5" />
                            {pa >= 0 ? '+' : ''}{fmt(pa)} {lang === 'en' ? 'profit' : 'মুনাফা'}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">{stockBadge(p)}</td>
                    <td className="px-5 py-4">{statusBadge(p.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setQrProduct(p)} className="h-8 w-8 p-0 text-slate-400 hover:text-violet-600" title={lang === 'en' ? 'Sale QR' : 'বিক্রয় কিউআর'}>
                          <QrCode className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="h-8 w-8 p-0">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(p.id)} className="h-8 w-8 p-0 text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {myProducts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{lang === 'en' ? 'No products found.' : 'কোনো পণ্য পাওয়া যায়নি।'}</p>
              <Button onClick={openAdd} className="mt-4 text-white" size="sm" style={{ backgroundColor: primaryColor }}>
                {t('admin.addProduct')}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? t('admin.editProduct') : t('admin.addProduct')}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic" className="mt-1">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="basic">{lang === 'en' ? 'Basic Info' : 'মূল তথ্য'}</TabsTrigger>
              <TabsTrigger value="media">{lang === 'en' ? 'Media' : 'মিডিয়া'}</TabsTrigger>
              <TabsTrigger value="pricing">{lang === 'en' ? 'Pricing & Stock' : 'মূল্য ও স্টক'}</TabsTrigger>
            </TabsList>

            {/* Tab: Basic Info */}
            <TabsContent value="basic" className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t('admin.name')}</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" />
                </div>
                <div className="space-y-1.5">
                  <Label>SKU</Label>
                  <Input
                    value={form.sku}
                    onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                    placeholder="e.g. FSH-PANT-001"
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{lang === 'en' ? 'Category' : 'ক্যাটাগরি'}</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={v => setForm(f => ({ ...f, categoryId: v, subcategoryId: '' }))}
                  >
                    <SelectTrigger><SelectValue placeholder={lang === 'en' ? 'Select category' : 'ক্যাটাগরি নির্বাচন'} /></SelectTrigger>
                    <SelectContent>
                      {allowedCats.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {lang === 'en' ? c.name : c.nameBn}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {allowedCats.length === 0 && <p className="text-xs text-amber-600">Contact super admin to get category access.</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{lang === 'en' ? 'Sub-category' : 'সাব-ক্যাটাগরি'}</Label>
                  <Select
                    value={form.subcategoryId}
                    onValueChange={v => setForm(f => ({ ...f, subcategoryId: v }))}
                    disabled={!form.categoryId || subcats.length === 0}
                  >
                    <SelectTrigger><SelectValue placeholder={lang === 'en' ? 'Select type' : 'ধরন নির্বাচন'} /></SelectTrigger>
                    <SelectContent>
                      {subcats.map(s => <SelectItem key={s.id} value={s.id}>{lang === 'en' ? s.name : s.nameBn}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{lang === 'en' ? 'Description' : 'বিবরণ'}</Label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder={lang === 'en' ? 'Product description...' : 'পণ্যের বিবরণ...'}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> {lang === 'en' ? 'Tags (comma separated)' : 'ট্যাগ'}</Label>
                <Input
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder={lang === 'en' ? 'new, sale, bestseller' : 'নতুন, সেল, জনপ্রিয়'}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{lang === 'en' ? 'Status' : 'অবস্থা'}</Label>
                <Select value={form.status} onValueChange={(v: AdminProduct['status']) => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{lang === 'en' ? 'Active' : 'সক্রিয়'}</SelectItem>
                    <SelectItem value="draft">{lang === 'en' ? 'Draft' : 'ড্রাফট'}</SelectItem>
                    <SelectItem value="inactive">{lang === 'en' ? 'Inactive' : 'নিষ্ক্রিয়'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Tab: Media */}
            <TabsContent value="media" className="space-y-5 pt-3">
              <div className="space-y-2">
                <Label>{lang === 'en' ? 'Product Images' : 'পণ্যের ছবি'}</Label>
                <ImageUploader images={form.images} onChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
              </div>
              <div className="border-t pt-4 space-y-5">
                <div>
                  <Label className="flex items-center gap-1.5 mb-2">
                    <Video className="w-3.5 h-3.5 text-red-600" />
                    {lang === 'en' ? 'YouTube video' : 'YouTube ভিডিও'}
                  </Label>
                  <YoutubeUrlField
                    value={form.youtubeUrl}
                    onChange={v => setForm(f => ({ ...f, youtubeUrl: v }))}
                    lang={lang}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5 mb-2">
                    <Video className="w-3.5 h-3.5 text-[#1877F2]" />
                    {lang === 'en' ? 'Facebook video' : 'Facebook ভিডিও'}
                  </Label>
                  <FacebookUrlField
                    value={form.facebookVideoUrl}
                    onChange={v => setForm(f => ({ ...f, facebookVideoUrl: v }))}
                    lang={lang}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab: Pricing & Stock */}
            <TabsContent value="pricing" className="space-y-5 pt-3">
              {/* Cost + Sell price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                    {lang === 'en' ? 'Cost Price (৳)' : 'ক্রয় মূল্য (৳)'}
                  </Label>
                  <Input
                    type="number"
                    value={form.costPrice}
                    onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))}
                    placeholder="0"
                  />
                  <p className="text-[11px] text-muted-foreground">{lang === 'en' ? 'What you paid (private)' : 'আপনার ক্রয় মূল্য (প্রাইভেট)'}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                    {lang === 'en' ? 'Sell Price (৳)' : 'বিক্রয় মূল্য (৳)'}
                  </Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0"
                  />
                  <p className="text-[11px] text-muted-foreground">{lang === 'en' ? 'Original selling price' : 'মূল বিক্রয় মূল্য'}</p>
                </div>
              </div>

              {/* Discount */}
              <div className="space-y-3 bg-orange-50/60 border border-orange-100 rounded-xl p-4">
                <Label className="flex items-center gap-1.5 text-orange-700">
                  <Percent className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Discount / Offer' : 'ছাড় / অফার'}
                </Label>
                <div className="flex gap-2">
                  {(['none', 'percent', 'amount'] as DiscountType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, discountType: type, discountValue: '' }))}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${form.discountType === type ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'}`}
                    >
                      {type === 'none'
                        ? (lang === 'en' ? 'No Discount' : 'ছাড় নেই')
                        : type === 'percent'
                        ? (lang === 'en' ? '% Off' : '% ছাড়')
                        : (lang === 'en' ? '৳ Off' : '৳ ছাড়')}
                    </button>
                  ))}
                </div>
                {form.discountType !== 'none' && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={form.discountValue}
                      onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                      placeholder={form.discountType === 'percent' ? '20' : '500'}
                      className="max-w-[120px]"
                    />
                    <span className="text-sm text-muted-foreground">
                      {form.discountType === 'percent' ? '%' : '৳'}
                      {lang === 'en' ? ' discount' : ' ছাড়'}
                    </span>
                  </div>
                )}
              </div>

              {/* Live profit calculator */}
              {(sellPrice > 0 || costPrice > 0) && (
                <div className="rounded-xl border bg-slate-50 p-4 space-y-2 text-sm">
                  <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    {lang === 'en' ? 'Profit Summary' : 'মুনাফা হিসাব'}
                  </p>
                  <div className="space-y-1.5 text-xs">
                    {sellPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{lang === 'en' ? 'Sell Price' : 'বিক্রয় মূল্য'}</span>
                        <span className="font-medium">{fmt(sellPrice)}</span>
                      </div>
                    )}
                    {form.discountType !== 'none' && form.discountValue && (
                      <div className="flex justify-between text-red-500">
                        <span>
                          {lang === 'en' ? 'Discount' : 'ছাড়'}
                          {form.discountType === 'percent' ? ` (${form.discountValue}%)` : ''}
                        </span>
                        <span>−{fmt(sellPrice - effPrice)}</span>
                      </div>
                    )}
                    {effPrice !== sellPrice && sellPrice > 0 && (
                      <div className="flex justify-between border-t pt-1.5">
                        <span className="font-medium text-emerald-700">{lang === 'en' ? 'Customer Pays' : 'গ্রাহক দেবে'}</span>
                        <span className="font-bold text-emerald-700">{fmt(effPrice)}</span>
                      </div>
                    )}
                    {costPrice > 0 && (
                      <>
                        <div className="flex justify-between text-muted-foreground">
                          <span>{lang === 'en' ? 'Cost Price' : 'ক্রয় মূল্য'}</span>
                          <span>−{fmt(costPrice)}</span>
                        </div>
                        <div className={`flex justify-between border-t pt-1.5 font-bold ${profit! >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          <span>{lang === 'en' ? 'Profit' : 'মুনাফা'}</span>
                          <span>
                            {profit! >= 0 ? '+' : ''}{fmt(profit!)}
                            {marginPct !== null && ` (${marginPct}%)`}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Stock */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label>{t('admin.stock')}</Label>
                  <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{lang === 'en' ? 'Min Stock Alert' : 'সর্বনিম্ন স্টক'}</Label>
                  <Input type="number" value={form.lowStockThreshold} onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('admin.cancel')}</Button>
            <Button onClick={saveProduct} className="text-white" style={{ backgroundColor: primaryColor }}>{t('admin.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Modal */}
      <QRModal product={qrProduct} shopSlug={shop?.slug} primaryColor={primaryColor} onClose={() => setQrProduct(null)} lang={lang} />

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{lang === 'en' ? 'Delete Product?' : 'পণ্য মুছবেন?'}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{lang === 'en' ? 'This action cannot be undone.' : 'এই পদক্ষেপটি পূর্বাবস্থায় ফেরানো যাবে না।'}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>{t('admin.cancel')}</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteProduct(deleteId)}>{t('admin.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
