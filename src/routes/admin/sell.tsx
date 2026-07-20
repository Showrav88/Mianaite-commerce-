import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { Plus, Minus, Trash2, Receipt, Search, CheckCircle, Printer } from 'lucide-react'
import { useAdminStore, fmt, effectivePrice, type AdminProduct } from '@/lib/admin-store'
import { ProductThumb } from '@/components/office/ProductThumb'
import { useCustomerStore } from '@/lib/customer-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/admin/sell')({
  component: SellPage,
  head: () => ({ meta: [{ title: 'Counter Sale — Admin' }] }),
})

interface CartItem {
  productId: string
  name: string
  qty: number
  price: number
  image: string
  stock: number
}

interface Invoice {
  invoiceNo: string
  shopName: string
  customerName: string
  customerPhone: string
  items: CartItem[]
  total: number
  createdAt: string
}

function SellPage() {
  const { user } = useAuth()
  const { products, shops, setProducts } = useAdminStore()
  const { registerCustomer, placeCustomerOrder } = useCustomerStore()
  const { lang, tx } = useI18n()

  const shop = shops.find(s => s.id === user?.shopId)
  const primaryColor = shop?.theme.primaryColor ?? '#1a1a2e'
  const accentColor = shop?.theme.accentColor ?? '#c9a84c'

  const myProducts = products.filter(p => p.shopId === user?.shopId && p.status === 'active')

  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [completing, setCompleting] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { searchRef.current?.focus() }, [])

  const filtered = myProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  function addToCart(p: AdminProduct) {
    const ep = effectivePrice(p)
    setCart(prev => {
      const existing = prev.find(i => i.productId === p.id)
      if (existing) {
        if (existing.qty >= p.stock) return prev
        return prev.map(i => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i)
      }
      if (p.stock === 0) return prev
      return [...prev, { productId: p.id, name: p.name, qty: 1, price: ep, image: p.images?.[0] ?? p.image, stock: p.stock }]
    })
  }

  function changeQty(productId: string, delta: number) {
    setCart(prev => prev
      .map(i => i.productId === productId ? { ...i, qty: Math.max(1, Math.min(i.stock, i.qty + delta)) } : i)
      .filter(i => i.qty > 0)
    )
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(i => i.productId !== productId))
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const canComplete = cart.length > 0 && customerName.trim() && customerPhone.trim()

  function completeSale() {
    if (!canComplete || !shop) return
    setCompleting(true)

    const customer = registerCustomer({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      shopId: shop.id,
      source: 'direct',
    })

    placeCustomerOrder({
      customerId: customer.id,
      shopId: shop.id,
      items: cart.map(i => ({ productId: i.productId, name: i.name, qty: i.qty, price: i.price })),
      total,
      address: tx('Showroom / Counter', 'শোরুম / কাউন্টার'),
    })

    setProducts(
      products.map(p => {
        const item = cart.find(i => i.productId === p.id)
        if (!item) return p
        return { ...p, stock: Math.max(0, p.stock - item.qty), sold: p.sold + item.qty }
      })
    )

    const now = new Date()
    setInvoice({
      invoiceNo: 'INV-' + now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + '-' + Date.now().toString().slice(-5),
      shopName: shop.name,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: [...cart],
      total,
      createdAt: now.toLocaleString('en-BD'),
    })

    setCart([])
    setCustomerName('')
    setCustomerPhone('')
    setCompleting(false)
  }

  function newSale() {
    setInvoice(null)
    setTimeout(() => searchRef.current?.focus(), 100)
  }

  if (!shop) {
    return <div className="p-6 text-muted-foreground">{tx('Shop not found.', 'শপ পাওয়া যায়নি।')}</div>
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden">
      {/* Left — product picker */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 border-r">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">{tx('Counter Sale', 'কাউন্টার বিক্রি')}</h1>
          <span className="text-xs text-muted-foreground">{lang === 'en' ? `${myProducts.length} products` : `${myProducts.length}টি পণ্য`}</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tx('Search by name or SKU…', 'নাম বা SKU দিয়ে খুঁজুন…')}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(p => {
            const ep = effectivePrice(p)
            const inCart = cart.find(i => i.productId === p.id)
            const outOfStock = p.stock === 0
            return (
              <button
                key={p.id}
                type="button"
                disabled={outOfStock}
                onClick={() => addToCart(p)}
                className="relative flex flex-col rounded-xl border bg-white overflow-hidden text-left transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={inCart ? { borderColor: primaryColor, boxShadow: `0 0 0 2px ${primaryColor}30` } : {}}
              >
                <div className="w-full aspect-square flex items-center justify-center bg-slate-50 border-b">
                  <ProductThumb src={p.images?.[0] ?? p.image} alt={p.name} size="lg" />
                </div>
                <div className="p-2 space-y-0.5">
                  <p className="text-xs font-semibold leading-tight line-clamp-2">{p.name}</p>
                  <p className="text-xs font-bold" style={{ color: primaryColor }}>{fmt(ep)}</p>
                  <p className="text-[10px] text-muted-foreground">{lang === 'en' ? `Stock: ${p.stock}` : `স্টক: ${p.stock}`}</p>
                </div>
                {inCart && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: primaryColor }}>
                    {inCart.qty}
                  </div>
                )}
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground text-center py-8">
              {tx('No products found.', 'কোনো পণ্য পাওয়া যায়নি।')}
            </p>
          )}
        </div>
      </div>

      {/* Right — cart + customer + checkout */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-50 border-t lg:border-t-0">
        {/* Customer info */}
        <div className="p-4 bg-white border-b space-y-3">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Receipt className="w-4 h-4" style={{ color: primaryColor }} />
            {tx('Customer Info', 'গ্রাহকের তথ্য')}
          </p>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">{tx('Name *', 'নাম *')}</Label>
              <Input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder={tx('Customer name', 'গ্রাহকের নাম')}
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">{tx('Phone *', 'ফোন *')}</Label>
              <Input
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="017..."
                className="mt-1 h-9"
                type="tel"
              />
            </div>
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {tx('Tap a product to add it.', 'পণ্য যোগ করতে ক্লিক করুন।')}
            </p>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
                <ProductThumb src={item.image} alt={item.name} size="lg" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{item.name}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: primaryColor }}>{fmt(item.price)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => changeQty(item.productId, -1)} className="w-6 h-6 rounded border flex items-center justify-center hover:bg-slate-100">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                  <button onClick={() => changeQty(item.productId, 1)} disabled={item.qty >= item.stock} className="w-6 h-6 rounded border flex items-center justify-center hover:bg-slate-100 disabled:opacity-40">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => removeFromCart(item.productId)} className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:text-red-600 ml-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total + complete */}
        <div className="p-4 bg-white border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{tx('Total', 'মোট')}</span>
            <span className="text-xl font-bold" style={{ color: primaryColor }}>{fmt(total)}</span>
          </div>
          <Button
            className="w-full text-white h-11 text-base font-semibold"
            style={{ backgroundColor: primaryColor }}
            disabled={!canComplete || completing}
            onClick={completeSale}
          >
            {completing
              ? (tx('Processing…', 'প্রক্রিয়া হচ্ছে…'))
              : (tx('Complete Sale & Print Invoice', 'বিক্রি সম্পন্ন ও ইনভয়েস'))
            }
          </Button>
          {!canComplete && cart.length > 0 && (
            <p className="text-xs text-amber-600 text-center">
              {tx('Enter customer name and phone to continue.', 'চালিয়ে যেতে গ্রাহকের নাম ও ফোন দিন।')}
            </p>
          )}
        </div>
      </div>

      {/* Invoice modal */}
      {invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 text-center text-white" style={{ backgroundColor: primaryColor }}>
              <CheckCircle className="w-10 h-10 mx-auto mb-2" style={{ color: accentColor }} />
              <p className="font-bold text-lg">{tx('Sale Complete!', 'বিক্রি সম্পন্ন!')}</p>
              <p className="text-xs opacity-70 mt-0.5">{invoice.shopName}</p>
            </div>

            {/* Invoice body */}
            <div id="invoice-print" className="px-6 py-4 space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{invoice.invoiceNo}</span>
                <span>{invoice.createdAt}</span>
              </div>

              <div className="border rounded-lg p-3 space-y-0.5 bg-slate-50 text-sm">
                <p><span className="text-muted-foreground">{tx('Name:', 'নাম:')}</span> <span className="font-semibold">{invoice.customerName}</span></p>
                <p><span className="text-muted-foreground">{tx('Phone:', 'ফোন:')}</span> <span className="font-semibold">{invoice.customerPhone}</span></p>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left pb-1">{tx('Item', 'পণ্য')}</th>
                    <th className="text-center pb-1">{tx('Qty', 'পরিমাণ')}</th>
                    <th className="text-right pb-1">{tx('Amount', 'পরিমাণ')}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map(item => (
                    <tr key={item.productId} className="border-b border-dashed">
                      <td className="py-1 pr-2 truncate max-w-35">{item.name}</td>
                      <td className="py-1 text-center">{item.qty}</td>
                      <td className="py-1 text-right font-medium">{fmt(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center font-bold text-base pt-1">
                <span>{tx('Total', 'মোট')}</span>
                <span style={{ color: primaryColor }}>{fmt(invoice.total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-5 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4" />
                {tx('Print', 'প্রিন্ট')}
              </Button>
              <Button
                className="flex-1 text-white"
                style={{ backgroundColor: primaryColor }}
                onClick={newSale}
              >
                {tx('New Sale', 'নতুন বিক্রি')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
