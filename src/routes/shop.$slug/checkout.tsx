import { createFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCart, Trash2, MapPin, Phone, User, CheckCircle, Package } from 'lucide-react'
import { useState } from 'react'
import { useAdminStore, fmt } from '@/lib/admin-store'
import { useShopCart } from '@/lib/shop-cart'
import { useI18n } from '@/lib/i18n'
import { useCustomerStore } from '@/lib/customer-store'
import ShopAuthModal from '@/components/shop/ShopAuthModal'

export const Route = createFileRoute('/shop/$slug/checkout')({
  component: ShopCheckoutPage,
})

function ShopCheckoutPage() {
  const { slug } = Route.useParams()
  const { shops } = useAdminStore()
  const { items, removeItem, updateQty, clear, total, count } = useShopCart()
  const { lang } = useI18n()
  const { currentCustomer, registerCustomer, placeCustomerOrder } = useCustomerStore()
const [authOpen, setAuthOpen] = useState(false)
  const [address, setAddress] = useState(currentCustomer ? '' : '')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [step, setStep] = useState<'cart' | 'details' | 'success'>('cart')
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')

  const shop = shops.find(s => s.slug === slug)!
  const radiusMap = { sharp: '8px', medium: '16px', rounded: '24px' }
  const radius = radiusMap[shop.theme.borderRadius]

  // Only show items from this shop
  const shopItems = items.filter(i => i.shopId === shop.id)

  function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!address.trim()) { setError(lang === 'en' ? 'Please enter delivery address.' : 'ডেলিভারি ঠিকানা দিন।'); return }

    let customer = currentCustomer
    if (!customer) {
      if (!guestName.trim()) { setError(lang === 'en' ? 'Name is required.' : 'নাম আবশ্যক।'); return }
      if (!guestPhone.trim()) { setError(lang === 'en' ? 'Phone is required.' : 'ফোন আবশ্যক।'); return }
      customer = registerCustomer({ name: guestName.trim(), phone: guestPhone.trim(), shopId: shop.id, source: 'direct' })
    }

    const order = placeCustomerOrder({
      customerId: customer.id,
      shopId: shop.id,
      items: shopItems.map(i => ({ productId: i.productId, name: i.name, qty: i.qty, price: i.price })),
      total,
      address: address.trim(),
    })
    setOrderId(order.id)
    clear()
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: shop.theme.primaryColor + '20' }}>
          <CheckCircle className="w-10 h-10" style={{ color: shop.theme.primaryColor }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {lang === 'en' ? 'Order Placed!' : 'অর্ডার সম্পন্ন!'}
        </h2>
        <p className="text-gray-500 text-sm mb-2">
          {lang === 'en' ? 'Order ID:' : 'অর্ডার আইডি:'} <span className="font-mono font-medium text-gray-800">{orderId}</span>
        </p>
        <p className="text-gray-500 text-sm mb-8">
          {lang === 'en'
            ? 'Thank you for your order! We will deliver your items soon via Cash on Delivery.'
            : 'আপনার অর্ডারের জন্য ধন্যবাদ! আমরা শীঘ্রই ক্যাশ অন ডেলিভারিতে আপনার পণ্য পৌঁছে দেব।'}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/shop/$slug"
            params={{ slug }}
            className="py-3 text-white font-semibold rounded-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: shop.theme.primaryColor, borderRadius: radius }}
          >
            {lang === 'en' ? 'Continue Shopping' : 'কেনাকাটা চালিয়ে যান'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        {lang === 'en' ? 'Your Cart' : 'আপনার কার্ট'} — {shop.name}
      </h1>

      {shopItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShoppingCart className="w-14 h-14 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">{lang === 'en' ? 'Your cart is empty' : 'কার্ট খালি'}</p>
          <Link to="/shop/$slug/products" params={{ slug }} className="text-sm font-medium hover:underline" style={{ color: shop.theme.primaryColor }}>
            {lang === 'en' ? 'Browse Products' : 'পণ্য দেখুন'}
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-5 gap-6">
          {/* Cart items */}
          <div className="md:col-span-3 space-y-3">
            {shopItems.map(item => (
              <div key={item.productId} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 line-clamp-2">{item.name}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: shop.theme.primaryColor }}>{fmt(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm">−</button>
                    <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm">+</button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary + form */}
          <div className="md:col-span-2">
            {/* Summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <h2 className="font-bold text-gray-900 mb-4">{lang === 'en' ? 'Order Summary' : 'অর্ডার সারাংশ'}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{lang === 'en' ? 'Items' : 'পণ্য'}</span>
                  <span>{count}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{lang === 'en' ? 'Subtotal' : 'সাব-টোটাল'}</span>
                  <span>{fmt(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{lang === 'en' ? 'Delivery' : 'ডেলিভারি'}</span>
                  <span className="text-green-600">{lang === 'en' ? 'Free' : 'বিনামূল্যে'}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                  <span>{lang === 'en' ? 'Total' : 'মোট'}</span>
                  <span style={{ color: shop.theme.primaryColor }}>{fmt(total)}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">{lang === 'en' ? 'Cash on Delivery' : 'ক্যাশ অন ডেলিভারি'}</span>
              </div>
            </div>

            {/* Checkout form */}
            <form onSubmit={handlePlaceOrder} className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-gray-900">{lang === 'en' ? 'Delivery Details' : 'ডেলিভারির তথ্য'}</h2>

              {currentCustomer && currentCustomer.shopId === shop.id ? (
                <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-green-700 font-medium">{currentCustomer.name}</span>
                  <span className="text-green-600 text-xs">• {currentCustomer.phone}</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {lang === 'en' ? 'Full Name' : 'পুরো নাম'} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder={lang === 'en' ? 'Your name' : 'আপনার নাম'} className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:outline-none" style={{ borderRadius: radius }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {lang === 'en' ? 'Phone' : 'ফোন'} *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:outline-none" style={{ borderRadius: radius }} />
                    </div>
                  </div>
                  <button type="button" onClick={() => setAuthOpen(true)} className="text-xs font-medium hover:underline" style={{ color: shop.theme.primaryColor }}>
                    {lang === 'en' ? 'Already have an account? Login' : 'অ্যাকাউন্ট আছে? লগইন করুন'}
                  </button>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {lang === 'en' ? 'Delivery Address' : 'ডেলিভারি ঠিকানা'} *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder={lang === 'en' ? 'House, Road, Area, City...' : 'বাসা, রাস্তা, এলাকা, শহর...'}
                    rows={3}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:outline-none resize-none"
                    style={{ borderRadius: radius }}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                type="submit"
                className="w-full py-3 text-white font-semibold rounded-xl transition-opacity hover:opacity-90"
                style={{ backgroundColor: shop.theme.primaryColor, borderRadius: radius }}
              >
                {lang === 'en' ? 'Place Order (COD)' : 'অর্ডার করুন (COD)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {authOpen && <ShopAuthModal shop={shop} radius={radius} onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
