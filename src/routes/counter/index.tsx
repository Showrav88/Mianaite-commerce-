import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useCallback } from 'react'
import { Search, Plus, Minus, Trash2, X, CreditCard, Smartphone, Banknote, Shuffle, CheckCircle2, Printer } from 'lucide-react'
import { useMarketStore } from '@/lib/market-store'
import { useI18n } from '@/lib/i18n'
import { MARKET_PRODUCTS, getMinPrice } from '@/mock/products'
import { MARKET_CATEGORIES } from '@/mock/categories'
import type { MarketOrder } from '@/mock/orders'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/counter/')({
  component: CounterPOS,
  head: () => ({ meta: [{ title: 'Counter POS — 1to99 Market' }] }),
})

const fmt = (n: number) => `৳${n.toLocaleString('en-BD')}`

const PAYMENT_TABS = [
  { id: 'cash', en: 'Cash', bn: 'নগদ', icon: Banknote, color: 'text-emerald-400' },
  { id: 'card', en: 'Card', bn: 'কার্ড', icon: CreditCard, color: 'text-blue-400' },
  { id: 'bkash', en: 'bKash', bn: 'বিকাশ', icon: Smartphone, color: 'text-pink-400' },
  { id: 'nagad', en: 'Nagad', bn: 'নগদ (Nagad)', icon: Smartphone, color: 'text-orange-400' },
  { id: 'split', en: 'Split', bn: 'ভাগ করে', icon: Shuffle, color: 'text-purple-400' },
] as const

type PaymentMethod = typeof PAYMENT_TABS[number]['id']

function QuickTile({ product, onAdd }: { product: typeof MARKET_PRODUCTS[0]; onAdd: () => void }) {
  const price = getMinPrice(product)
  const cat = MARKET_CATEGORIES.find(c => c.id === product.categoryId)
  return (
    <button
      onClick={onAdd}
      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-600 rounded-xl p-3 text-left transition-all group min-h-[80px] flex flex-col"
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-lg leading-none">{cat?.icon ?? '📦'}</span>
        <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
      </div>
      <p className="text-xs font-medium text-white leading-tight line-clamp-2 flex-1">{product.name}</p>
      <p className="text-xs font-bold text-emerald-400 mt-1">{fmt(price)}</p>
    </button>
  )
}

function CartLine({
  item, onQty, onRemove,
}: {
  item: ReturnType<typeof useMarketStore>['counterCart'][0]
  onQty: (q: number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-slate-800">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white leading-tight">{item.productName}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{item.variantLabel}</p>
        <p className="text-xs text-emerald-400 font-semibold mt-0.5">{fmt(item.unitPrice)}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={() => onQty(item.qty - 1)} className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors">
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-8 text-center text-sm font-bold text-white">{item.qty}</span>
        <button onClick={() => onQty(item.qty + 1)} className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors">
          <Plus className="w-3 h-3" />
        </button>
        <button onClick={onRemove} className="w-7 h-7 rounded-lg hover:bg-red-900/50 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors ml-1">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

function ReceiptModal({ order, onClose }: { order: MarketOrder; onClose: () => void }) {
  const { t } = useI18n()
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-white text-black font-mono text-xs">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm text-center">{t('counter.receiptTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 border-t border-dashed pt-3">
          <p className="text-center font-bold text-sm">1to99 Market — Mirpur</p>
          <p className="text-center text-[10px]">Shop #12, Mirpur-10, Dhaka 1216</p>
          <p className="text-center text-[10px]">+880 1711-234567</p>
          <div className="border-t border-dashed my-2" />
          <div className="flex justify-between"><span>Order#</span><span>{order.orderNumber}</span></div>
          <div className="flex justify-between"><span>Date</span><span>{order.createdAt}</span></div>
          <div className="flex justify-between"><span>Cashier</span><span>{order.cashier}</span></div>
          <div className="border-t border-dashed my-2" />
          {order.items.map(item => (
            <div key={item.variantId}>
              <p className="font-medium truncate">{item.productName}</p>
              <div className="flex justify-between pl-2 text-[10px]">
                <span>{item.variantLabel} × {item.qty}</span>
                <span>{fmt(item.subtotal)}</span>
              </div>
            </div>
          ))}
          <div className="border-t border-dashed my-2" />
          {order.discount > 0 && (
            <div className="flex justify-between"><span>Discount</span><span>-{fmt(order.discount)}</span></div>
          )}
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL</span><span>{fmt(order.total)}</span>
          </div>
          <div className="flex justify-between"><span>Payment</span><span className="capitalize">{order.paymentMethod}</span></div>
          <div className="border-t border-dashed my-2" />
          <p className="text-center text-[10px]">{t('counter.thankYou')}</p>
          <p className="text-center text-[10px]">Short code: 1T99-DHK-MRP-001</p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>
            <Printer className="w-3.5 h-3.5 mr-1.5" /> {t('counter.print')}
          </Button>
          <Button size="sm" className="flex-1" onClick={onClose}>
            {t('counter.newSale')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CounterPOS() {
  const { counterCart, addToCounterCart, updateCounterCartQty, removeFromCounterCart, clearCounterCart, addOrder, currentShift, startShift } = useMarketStore()
  const { t, lang } = useI18n()
  const [query, setQuery] = useState('')
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [showPayment, setShowPayment] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<MarketOrder | null>(null)
  const [showShiftModal, setShowShiftModal] = useState(!currentShift || !!currentShift.endedAt)
  const [shiftCashier, setShiftCashier] = useState(lang === 'bn' ? 'শরিফুল ইসলাম' : 'Shariful Islam')
  const [shiftCash, setShiftCash] = useState(5000)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return MARKET_PRODUCTS.filter(p =>
      p.status === 'active' && (
        p.name.toLowerCase().includes(q) ||
        p.slug.includes(q) ||
        p.variants.some(v => v.sku.toLowerCase().includes(q))
      )
    )
  }, [query])

  const topSellers = useMemo(() => MARKET_PRODUCTS.filter(p => p.status === 'active').slice(0, 12), [])

  const subtotal = counterCart.reduce((s, i) => s + i.unitPrice * i.qty, 0)
  const total = Math.max(0, subtotal - discount)

  const addFirstVariant = useCallback((product: typeof MARKET_PRODUCTS[0]) => {
    const v = product.variants[0]
    if (!v) return
    addToCounterCart({
      productId: product.id, productName: product.name,
      variantId: v.id, variantSku: v.sku,
      variantLabel: Object.values(v.attributes).join(' / ') || 'Standard',
      unitPrice: v.price, qty: 1,
    })
    toast.success(lang === 'bn' ? `${product.name} যোগ হয়েছে` : `${product.name} added`, { duration: 1200 })
    setQuery('')
  }, [addToCounterCart, lang])

  function completeOrder() {
    if (counterCart.length === 0) return
    const order: MarketOrder = {
      id: `ord_ctr_${Date.now()}`,
      orderNumber: `1T99-CTR-${Date.now().toString().slice(-6)}`,
      shopId: 'shop_mirpur', source: 'counter', status: 'delivered',
      customerName: lang === 'bn' ? 'ওয়াক-ইন গ্রাহক' : 'Walk-in Customer',
      customerPhone: '—',
      items: counterCart.map(i => ({
        productId: i.productId, productName: i.productName,
        variantId: i.variantId, variantSku: i.variantSku, variantLabel: i.variantLabel,
        qty: i.qty, unitPrice: i.unitPrice, subtotal: i.unitPrice * i.qty,
      })),
      subtotal, discount, total, paymentMethod,
      cashier: currentShift?.cashier ?? 'Staff',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    addOrder(order)
    clearCounterCart()
    setDiscount(0)
    setShowPayment(false)
    setCompletedOrder(order)
    toast.success(lang === 'bn' ? `বিক্রয় সম্পন্ন — ${fmt(order.total)}` : `Sale complete — ${fmt(order.total)}`)
  }

  const payTab = PAYMENT_TABS.find(p => p.id === paymentMethod)!

  return (
    <>
      {/* Shift start modal */}
      <Dialog open={showShiftModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm" onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{lang === 'bn' ? 'কাউন্টার শিফট শুরু করুন' : 'Start Counter Shift'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('counter.cashierName')}</label>
              <Input value={shiftCashier} onChange={e => setShiftCashier(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('counter.openingCash')}</label>
              <Input type="number" value={shiftCash} onChange={e => setShiftCash(Number(e.target.value))} />
            </div>
            <Button className="w-full" onClick={() => { startShift(shiftCashier, shiftCash); setShowShiftModal(false) }} disabled={!shiftCashier.trim()}>
              {t('counter.startShift')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt modal */}
      {completedOrder && <ReceiptModal order={completedOrder} onClose={() => setCompletedOrder(null)} />}

      {/* Payment modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('counter.collectPayment')} — {fmt(total)}</DialogTitle>
          </DialogHeader>
          <Tabs value={paymentMethod} onValueChange={v => setPaymentMethod(v as PaymentMethod)}>
            <TabsList className="grid grid-cols-5 w-full">
              {PAYMENT_TABS.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="text-xs px-1">{lang === 'bn' ? tab.bn : tab.en}</TabsTrigger>
              ))}
            </TabsList>
            {PAYMENT_TABS.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="pt-4 space-y-3">
                <div className="rounded-xl bg-slate-50 border p-4 text-center">
                  <tab.icon className={`w-8 h-8 mx-auto mb-2 ${tab.color}`} />
                  <p className="text-2xl font-bold">{fmt(total)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('counter.via')} {lang === 'bn' ? tab.bn : tab.en}</p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          <Button className="w-full mt-2 gap-2" onClick={completeOrder}>
            <CheckCircle2 className="w-4 h-4" /> {t('counter.confirmPayment')}
          </Button>
        </DialogContent>
      </Dialog>

      <div className="flex h-full">
        {/* Left — search + quick tiles */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden border-r border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('counter.scanBarcode')}
              className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {query ? (
              <div className="space-y-1">
                {filtered.length === 0 && (
                  <p className="text-center text-slate-500 py-8 text-sm">
                    {lang === 'bn' ? `"${query}" এর জন্য কোনো পণ্য পাওয়া যায়নি` : `No products found for "${query}"`}
                  </p>
                )}
                {filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addFirstVariant(p)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-600 transition-all text-left group"
                  >
                    <span className="text-xl">{MARKET_CATEGORIES.find(c => c.id === p.categoryId)?.icon ?? '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.variants[0]?.sku}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-emerald-400">{fmt(getMinPrice(p))}</p>
                      <p className="text-xs text-slate-500">{p.variants.reduce((s, v) => s + v.stock, 0)} {t('counter.inStock')}</p>
                    </div>
                    <Plus className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">{t('counter.quickAdd')}</p>
                <div className="grid grid-cols-4 gap-2">
                  {topSellers.map(p => <QuickTile key={p.id} product={p} onAdd={() => addFirstVariant(p)} />)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right — cart */}
        <div className="w-80 flex flex-col bg-slate-900">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">{t('counter.currentSale')}</h2>
              {counterCart.length > 0 && (
                <button onClick={clearCounterCart} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
                  {t('counter.clearAll')}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            {counterCart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-3xl mb-3">🛒</p>
                <p className="text-sm text-slate-400">{t('counter.cartEmpty')}</p>
                <p className="text-xs text-slate-600 mt-1">{t('counter.cartHint')}</p>
              </div>
            ) : (
              <div>
                {counterCart.map(item => (
                  <CartLine key={item.variantId} item={item}
                    onQty={q => updateCounterCartQty(item.variantId, q)}
                    onRemove={() => removeFromCounterCart(item.variantId)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>{t('counter.subtotal')}</span>
              <span className="text-white">{fmt(subtotal)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 shrink-0">{t('counter.discount')}</span>
              <input
                type="number" min={0} value={discount || ''} onChange={e => setDiscount(Number(e.target.value))}
                placeholder="0"
                className="flex-1 h-8 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <Separator className="bg-slate-700" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{t('counter.total')}</span>
              <span className="text-xl font-bold text-emerald-400">{fmt(total)}</span>
            </div>
            <button
              onClick={() => { if (counterCart.length > 0) setShowPayment(true) }}
              disabled={counterCart.length === 0}
              className="w-full h-14 rounded-xl text-white font-bold text-lg transition-all bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('counter.charge')} {counterCart.length > 0 ? fmt(total) : ''}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
