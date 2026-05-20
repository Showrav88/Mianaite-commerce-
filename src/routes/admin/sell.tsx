import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { ScanLine, Store, Copy, Check, ExternalLink } from 'lucide-react'
import { useAdminStore, fmt, effectivePrice, type AdminProduct } from '@/lib/admin-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  openProductForSale,
  resolveProductFromScan,
  shopProductPageUrl,
} from '@/lib/shop-url'

export const Route = createFileRoute('/admin/sell')({
  component: SellPage,
  head: () => ({ meta: [{ title: 'Counter Sale — Admin' }] }),
})

function SellPage() {
  const { user } = useAuth()
  const { products, shops } = useAdminStore()
  const { lang } = useI18n()
  const [scanValue, setScanValue] = useState('')
  const [scanError, setScanError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showCounterLinks, setShowCounterLinks] = useState(false)
  const scanRef = useRef<HTMLInputElement>(null)

  const shop = shops.find(s => s.id === user?.shopId)
  const primaryColor = shop?.theme.primaryColor ?? '#f97316'
  const myProducts = products.filter(p => p.shopId === user?.shopId && p.status === 'active')

  useEffect(() => {
    scanRef.current?.focus()
  }, [])

  function handleScanSubmit(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return
    setScanError('')

    const resolved = resolveProductFromScan(trimmed, products)

    if (resolved) {
      openProductForSale(shop?.slug ?? '', resolved.id)
      setScanValue('')
      return
    }

    setScanError(
      lang === 'en'
        ? 'Product not found. Scan your sale QR or enter SKU.'
        : 'পণ্য পাওয়া যায়নি। সেল কিউআর স্ক্যান করুন বা SKU দিন।',
    )
  }

  async function copyCounterLink(p: AdminProduct) {
    if (!shop?.slug) return
    const url = shopProductPageUrl(shop.slug, p.id)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopiedId(p.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!shop) {
    return (
      <div className="p-6 text-muted-foreground">
        {lang === 'en' ? 'Shop not found.' : 'শপ পাওয়া যায়নি।'}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{lang === 'en' ? 'Counter & offline sale' : 'কাউন্টার ও অফলাইন বিক্রি'}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === 'en'
            ? 'Scan a sale QR or pick a product — opens the shop page for the buyer. Nothing is added to cart automatically.'
            : 'সেল কিউআর স্ক্যান করুন বা পণ্য বেছে নিন — ক্রেতার জন্য শপ পেজ খুলবে। কার্টে স্বয়ংক্রিয়ভাবে কিছু যোগ হয় না।'}
        </p>
      </div>

      <Card className="border-0 shadow-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ScanLine className="w-4 h-4" style={{ color: primaryColor }} />
            {lang === 'en' ? 'Scan product' : 'পণ্য স্ক্যান'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-pulse" />
            <Input
              ref={scanRef}
              value={scanValue}
              onChange={e => { setScanValue(e.target.value); setScanError('') }}
              onKeyDown={e => e.key === 'Enter' && handleScanSubmit(scanValue)}
              placeholder={lang === 'en' ? 'Scan sale QR or type SKU, press Enter' : 'সেল কিউআর বা SKU, Enter চাপুন'}
              className="pl-9 h-12 text-base"
              autoComplete="off"
            />
          </div>
          {scanError && <p className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">{scanError}</p>}
          <p className="text-xs text-muted-foreground">
            {lang === 'en'
              ? 'Works with printed sale QR codes and barcode scanners at your stall.'
              : 'স্টলের প্রিন্ট করা সেল কিউআর ও বারকোড স্ক্যানারের সাথে কাজ করে।'}
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          {lang === 'en' ? 'Quick open (in-store)' : 'দ্রুত খুলুন (দোকানে)'}
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {myProducts.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => openProductForSale(shop.slug, p.id)}
              className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:shadow-md transition-all text-left"
            >
              <img src={p.images?.[0] ?? p.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: primaryColor }}>{fmt(effectivePrice(p))}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          ))}
          {myProducts.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-2">
              {lang === 'en' ? 'No active products.' : 'কোনো সক্রিয় পণ্য নেই।'}
            </p>
          )}
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <button
          type="button"
          onClick={() => setShowCounterLinks(v => !v)}
          className="w-full px-6 py-4 flex items-center justify-between text-left"
        >
          <span className="font-medium text-sm">
            {lang === 'en' ? 'Counter links (staff only)' : 'কাউন্টার লিংক (স্টাফ)'}
          </span>
          <span className="text-xs text-muted-foreground">{showCounterLinks ? '▲' : '▼'}</span>
        </button>
        {showCounterLinks && (
          <CardContent className="pt-0 pb-4 space-y-2 border-t">
            <p className="text-xs text-muted-foreground pb-2">
              {lang === 'en'
                ? 'Copy a product link for remote counters (WhatsApp, etc.). Not shown on sale QR.'
                : 'দূরবর্তী কাউন্টারের জন্য লিংক কপি করুন। সেল কিউআর-এ দেখানো হয় না।'}
            </p>
            {myProducts.map(p => (
              <div key={p.id} className="flex items-center gap-2 py-1.5">
                <span className="text-sm truncate flex-1">{p.name}</span>
                <Button variant="outline" size="sm" className="shrink-0 gap-1 h-8" onClick={() => copyCounterLink(p)}>
                  {copiedId === p.id ? <><Check className="w-3 h-3" /> {lang === 'en' ? 'OK' : 'ঠিক'}</> : <><Copy className="w-3 h-3" /> {lang === 'en' ? 'Copy' : 'কপি'}</>}
                </Button>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      <Link
        to="/shop/$slug"
        params={{ slug: shop.slug }}
        target="_blank"
        className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
        style={{ color: primaryColor }}
      >
        <Store className="w-4 h-4" />
        {lang === 'en' ? 'Open full storefront' : 'পুরো শপ খুলুন'}
      </Link>
    </div>
  )
}
