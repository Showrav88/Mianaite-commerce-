import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  Search, Plus, Minus, Trash2, X, CreditCard, Smartphone, Banknote, Shuffle,
  CheckCircle2, Printer, User,
} from 'lucide-react'
import { useMarketStore, expectedDrawerCash } from '@/lib/market-store'
import { useAdminStore, fmt, effectivePrice, type AdminProduct } from '@/lib/admin-store'
import { useOfficeStore } from '@/lib/office-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { lastClosedShiftForShop } from '@/lib/pos-shift'
import type { MarketOrder } from '@/mock/orders'
import { ProductThumb } from '@/components/office/ProductThumb'
import { ConfirmDialog } from '@/components/office/ConfirmDialog'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'

export const Route = createFileRoute('/counter/')({
  component: FullScreenPOS,
  head: () => ({ meta: [{ title: 'POS — 1to99' }] }),
})

const PAYMENT_TABS = [
  { id: 'cash', en: 'Cash', bn: 'নগদ', icon: Banknote },
  { id: 'card', en: 'Card', bn: 'কার্ড', icon: CreditCard },
  { id: 'bkash', en: 'bKash', bn: 'বিকাশ', icon: Smartphone },
  { id: 'nagad', en: 'Nagad', bn: 'নগদ', icon: Smartphone },
  { id: 'split', en: 'Split', bn: 'ভাগ', icon: Shuffle },
] as const

type PaymentMethod = typeof PAYMENT_TABS[number]['id']

interface CartLine {
  productId: string
  name: string
  sku: string
  qty: number
  unitPrice: number
  stock: number
}

function FullScreenPOS() {
  const { user } = useAuth()
  const shopId = user?.shopId ?? 'shop_6'
  const { products, setProducts, shops } = useAdminStore()
  const { addWalletTxn } = useOfficeStore()
  const {
    addOrder, currentShift, shiftHistory, startShift, getActiveShift,
  } = useMarketStore()
  const { t, lang, tx } = useI18n()

  const shop = shops.find(s => s.id === shopId)
  const accent = shop?.theme.primaryColor ?? '#10b981'

  const activeShift = getActiveShift(shopId)
  const needsShift = !activeShift
  const lastClosed = lastClosedShiftForShop(shiftHistory, shopId)

  const [shiftOpen, setShiftOpen] = useState(needsShift)
  const [openingCash, setOpeningCash] = useState(String(lastClosed?.closingCash ?? 0))
  const [cashConfirmed, setCashConfirmed] = useState(false)

  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [discount, setDiscount] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [showPayment, setShowPayment] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<MarketOrder | null>(null)
  const [payConfirmOpen, setPayConfirmOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setShiftOpen(needsShift)
  }, [needsShift])

  useEffect(() => {
    if (!needsShift) searchRef.current?.focus()
  }, [needsShift])

  const myProducts = useMemo(
    () => products.filter(p => p.shopId === shopId && p.status === 'active' && p.stock > 0),
    [products, shopId],
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return myProducts.slice(0, 24)
    return myProducts.filter(p =>
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    )
  }, [query, myProducts])

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0)
  const total = Math.max(0, subtotal - discount)

  const drawerExpected = activeShift ? expectedDrawerCash(activeShift) : 0

  const addProduct = useCallback((p: AdminProduct) => {
    const price = effectivePrice(p)
    setCart(prev => {
      const ex = prev.find(i => i.productId === p.id)
      if (ex) {
        if (ex.qty >= p.stock) return prev
        return prev.map(i => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { productId: p.id, name: p.name, sku: p.sku, qty: 1, unitPrice: price, stock: p.stock }]
    })
    setQuery('')
    toast.success(tx('Added', 'যোগ হয়েছে'), { duration: 800 })
  }, [tx])

  function changeQty(productId: string, delta: number) {
    setCart(prev => prev
      .map(i => {
        if (i.productId !== productId) return i
        const q = Math.max(0, Math.min(i.stock, i.qty + delta))
        return { ...i, qty: q }
      })
      .filter(i => i.qty > 0)
    )
  }

  function executeSale() {
    if (!activeShift || cart.length === 0 || !user) return
    const now = new Date()
    const day = now.toISOString().slice(0, 10)
    const orderNumber = `POS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-5)}`
    const walkIn = tx('Walk-in', 'ওয়াক-ইন')
    const name = customerName.trim() || walkIn
    const phone = customerPhone.trim() || '—'

    setProducts(products.map(p => {
      const line = cart.find(c => c.productId === p.id)
      if (!line) return p
      return { ...p, stock: Math.max(0, p.stock - line.qty), sold: p.sold + line.qty }
    }))

    if (paymentMethod === 'cash') {
      addWalletTxn({
        type: 'sell',
        amount: total,
        method: 'cash',
        note: `POS ${orderNumber}`,
      })
    }

    const order: MarketOrder = {
      id: `ord_pos_${Date.now()}`,
      orderNumber,
      shopId,
      source: 'counter',
      status: 'delivered',
      customerName: name,
      customerPhone: phone,
      items: cart.map(i => ({
        productId: i.productId,
        productName: i.name,
        variantId: i.productId,
        variantSku: i.sku,
        variantLabel: 'Standard',
        qty: i.qty,
        unitPrice: i.unitPrice,
        subtotal: i.unitPrice * i.qty,
      })),
      subtotal,
      discount,
      total,
      paymentMethod,
      cashier: activeShift.staffName,
      createdAt: day,
      updatedAt: day,
    }
    addOrder(order)
    setCart([])
    setDiscount(0)
    setCustomerName('')
    setCustomerPhone('')
    setShowPayment(false)
    setCompletedOrder(order)
    toast.success(tx(`Sale — ${fmt(total)}`, `বিক্রয় — ${fmt(total)}`))
  }

  function handleStartShift() {
    if (!user || !cashConfirmed) return
    const opening = Number(openingCash)
    if (Number.isNaN(opening) || opening < 0) {
      toast.error(tx('Enter valid opening cash (0 if empty).', 'খোলার নগদ দিন (খালি হলে ০)।'))
      return
    }
    if (currentShift && !currentShift.endedAt && currentShift.shopId === shopId && currentShift.staffId !== user.id) {
      if (user.role === 'staff') {
        toast.error(tx('Another staff shift is active. Ask manager to close it.', 'অন্য কর্মীর শিফট চলছে।'))
        return
      }
      toast.error(tx('End the active shift first (header → End Shift).', 'আগে চালু শিফট শেষ করুন।'))
      return
    }
    const ok = startShift({
      shopId,
      staffId: user.id,
      staffName: user.name,
      staffRole: user.role,
      openingCash: opening,
    })
    if (!ok) {
      toast.error(tx('End the active shift before starting a new one.', 'নতুন শিফটের আগে আগেরটি শেষ করুন।'))
      return
    }
    setShiftOpen(false)
    setCashConfirmed(false)
  }

  const payTab = PAYMENT_TABS.find(p => p.id === paymentMethod)!

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white">
      {/* Shift start — staff must confirm drawer cash */}
      <Dialog open={shiftOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{tx('Confirm cash drawer & start shift', 'নগদ দরাজ নিশ্চিত করে শিফট শুরু')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {tx(
              'Count the cash in the drawer now. Enter ৳0 if the owner took all cash overnight. Morning float is often ৳1000–৳5000.',
              'দরাজের নগদ গুনুন। রাতে মালিক নিয়ে গেলে ০ লিখুন। সকালে ১০০০–৫০০০ টাকা থাকতে পারে।',
            )}
          </p>
          {lastClosed?.closingCash != null && (
            <p className="text-xs bg-slate-100 rounded-lg px-3 py-2">
              {tx('Last shift closing count', 'গত শিফট শেষে গণনা')}: <strong>{fmt(lastClosed.closingCash)}</strong>
              {lastClosed.cashVariance != null && lastClosed.cashVariance !== 0 && (
                <span className="text-amber-700"> · {tx('Variance', 'পার্থক্য')} {fmt(lastClosed.cashVariance)}</span>
              )}
            </p>
          )}
          {currentShift && !currentShift.endedAt && currentShift.staffId !== user?.id && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {tx('Active shift', 'চালু শিফট')}: {currentShift.staffName}. {user?.role === 'staff'
                ? tx('Contact manager to close before you start.', 'শুরু করতে ম্যানেজারকে বলুন।')
                : tx('You can start a new shift after confirming drawer (previous shift will need closing).', 'দরাজ নিশ্চিত করে নতুন শিফট — আগেরটি বন্ধ করতে হবে।')}
            </p>
          )}
          <div className="space-y-3 pt-2">
            <div>
              <Label>{t('counter.openingCash')}</Label>
              <Input
                type="number"
                min={0}
                className="mt-1 text-lg font-semibold"
                value={openingCash}
                onChange={e => setOpeningCash(e.target.value)}
              />
            </div>
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <Checkbox checked={cashConfirmed} onCheckedChange={v => setCashConfirmed(v === true)} className="mt-0.5" />
              <span>{tx('I confirm this amount is physically in the cash drawer.', 'দরাজে এত টাকা আছে তা নিশ্চিত করছি।')}</span>
            </label>
            <Button className="w-full" disabled={!cashConfirmed || !user} onClick={handleStartShift}>
              {t('counter.startShift')} — {user?.name}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Live drawer bar */}
      {activeShift && (
        <div className="shrink-0 px-4 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
          <span className="text-emerald-400 font-medium">{t('counter.shiftActive')}: {activeShift.staffName}</span>
          <span>{tx('Opening', 'খোলা')}: <strong className="text-white">{fmt(activeShift.openingCash)}</strong></span>
          <span>{tx('Cash sales', 'নগদ বিক্রয়')}: <strong className="text-white">{fmt(activeShift.totals.cash)}</strong></span>
          <span>{tx('Drawer (expected)', 'দরাজ (আনুমানিক)')}: <strong className="text-emerald-300">{fmt(drawerExpected)}</strong></span>
          <span>{t('counter.sales')}: {activeShift.totals.bills} · {fmt(activeShift.totals.revenue)}</span>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Products */}
        <div className="flex-1 flex flex-col p-3 gap-3 min-w-0 border-r border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              disabled={needsShift}
              placeholder={t('counter.scanBarcode')}
              className="w-full h-14 bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-10 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
              {filtered.map(p => {
                const ep = effectivePrice(p)
                const inCart = cart.find(c => c.productId === p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={needsShift}
                    onClick={() => addProduct(p)}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-600 rounded-xl p-2 text-left transition-all disabled:opacity-30 min-h-[100px] flex flex-col"
                  >
                    <div className="w-full aspect-square max-h-16 bg-slate-800 rounded-lg mb-1 flex items-center justify-center overflow-hidden">
                      <ProductThumb src={p.images?.[0] ?? p.image} alt={p.name} size="md" />
                    </div>
                    <p className="text-[11px] font-medium line-clamp-2 leading-tight flex-1">{p.name}</p>
                    <p className="text-xs font-bold text-emerald-400 mt-1">{fmt(ep)}</p>
                    {inCart && <span className="text-[10px] text-orange-400">×{inCart.qty}</span>}
                  </button>
                )
              })}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-slate-500 py-12">{tx('No products in stock.', 'স্টকে পণ্য নেই।')}</p>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="w-[min(100%,420px)] flex flex-col bg-slate-900 shrink-0">
          <div className="p-3 border-b border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-400 flex items-center gap-1"><User className="w-3.5 h-3.5" /> {tx('Customer (optional)', 'গ্রাহক (ঐচ্ছিক)')}</p>
            <Input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder={tx('Name', 'নাম')}
              className="h-9 bg-slate-950 border-slate-700"
              disabled={needsShift}
            />
            <Input
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder={tx('Phone', 'ফোন')}
              className="h-9 bg-slate-950 border-slate-700"
              type="tel"
              disabled={needsShift}
            />
          </div>

          <div className="px-3 py-2 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-semibold">{t('counter.currentSale')}</h2>
            {cart.length > 0 && (
              <button type="button" onClick={() => setCart([])} className="text-xs text-slate-500 hover:text-red-400">{t('counter.clearAll')}</button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3">
            {cart.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-12">{t('counter.cartEmpty')}</p>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex gap-2 py-2 border-b border-slate-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-emerald-400">{fmt(item.unitPrice)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => changeQty(item.productId, -1)} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center font-bold">{item.qty}</span>
                    <button type="button" onClick={() => changeQty(item.productId, 1)} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                    <button type="button" onClick={() => changeQty(item.productId, -item.qty)} className="p-1 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-slate-800 space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>{t('counter.subtotal')}</span><span>{fmt(subtotal)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 shrink-0">{t('counter.discount')}</span>
              <input
                type="number"
                min={0}
                value={discount || ''}
                onChange={e => setDiscount(Number(e.target.value))}
                className="flex-1 h-9 bg-slate-950 border border-slate-700 rounded-lg px-2 text-sm"
                disabled={needsShift}
              />
            </div>
            <Separator className="bg-slate-700" />
            <div className="flex justify-between items-center">
              <span className="font-bold">{t('counter.total')}</span>
              <span className="text-2xl font-bold text-emerald-400">{fmt(total)}</span>
            </div>
            <button
              type="button"
              disabled={cart.length === 0 || needsShift}
              onClick={() => setShowPayment(true)}
              className="w-full h-16 rounded-xl font-bold text-lg text-white disabled:opacity-30"
              style={{ backgroundColor: accent }}
            >
              {t('counter.charge')} {cart.length > 0 ? fmt(total) : ''}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('counter.collectPayment')} — {fmt(total)}</DialogTitle>
          </DialogHeader>
          <Tabs value={paymentMethod} onValueChange={v => setPaymentMethod(v as PaymentMethod)}>
            <TabsList className="grid grid-cols-5 w-full">
              {PAYMENT_TABS.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="text-[10px] px-0.5">{lang === 'bn' ? tab.bn : tab.en}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={paymentMethod} className="pt-4">
              <div className="rounded-xl border p-6 text-center">
                <payTab.icon className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
                <p className="text-3xl font-bold">{fmt(total)}</p>
              </div>
            </TabsContent>
          </Tabs>
          <Button className="w-full gap-2" onClick={() => { setShowPayment(false); setPayConfirmOpen(true) }}>
            <CheckCircle2 className="w-4 h-4" /> {t('counter.confirmPayment')}
          </Button>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={payConfirmOpen}
        onOpenChange={setPayConfirmOpen}
        title={tx('Complete this sale?', 'বিক্রি সম্পন্ন?')}
        confirmLabel={tx('Yes, charge', 'হ্যাঁ, নিন')}
        cancelLabel={tx('Cancel', 'বাতিল')}
        onConfirm={executeSale}
      >
        <p>{fmt(total)} · {lang === 'bn' ? payTab.bn : payTab.en}</p>
        {(customerName || customerPhone) && (
          <p className="text-sm text-muted-foreground">{customerName} {customerPhone}</p>
        )}
      </ConfirmDialog>

      <Dialog open={!!completedOrder} onOpenChange={() => setCompletedOrder(null)}>
        <DialogContent className="max-w-sm font-mono text-xs">
          <DialogHeader><DialogTitle>{shop?.name ?? '1to99'}</DialogTitle></DialogHeader>
          {completedOrder && (
            <>
              <p>{completedOrder.orderNumber}</p>
              <p className="font-bold text-lg">{fmt(completedOrder.total)}</p>
              <p>{completedOrder.cashier}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => window.print()}><Printer className="w-3.5 h-3.5 mr-1" />{t('counter.print')}</Button>
                <Button size="sm" className="flex-1" onClick={() => setCompletedOrder(null)}>{t('counter.newSale')}</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
