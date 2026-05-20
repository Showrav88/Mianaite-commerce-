import { useState } from 'react'
import { X, Phone, User } from 'lucide-react'
import { useCustomerStore } from '@/lib/customer-store'
import { useI18n } from '@/lib/i18n'
import type { Shop } from '@/lib/admin-store'

interface Props {
  shop: Shop
  radius: string
  onClose: () => void
}

export default function ShopAuthModal({ shop, radius, onClose }: Props) {
  const { lang } = useI18n()
  const { registerCustomer, loginCustomer } = useCustomerStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!phone.trim()) { setError(lang === 'en' ? 'Phone number is required.' : 'ফোন নম্বর আবশ্যক।'); return }

    if (mode === 'login') {
      const customer = loginCustomer(phone.trim(), shop.id)
      if (!customer) {
        setError(lang === 'en' ? 'No account found. Please register.' : 'অ্যাকাউন্ট পাওয়া যায়নি। নিবন্ধন করুন।')
        return
      }
    } else {
      if (!name.trim()) { setError(lang === 'en' ? 'Name is required.' : 'নাম আবশ্যক।'); return }
      registerCustomer({ name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, shopId: shop.id, source: 'direct' })
    }
    setSuccess(true)
    setTimeout(onClose, 900)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ backgroundColor: shop.theme.primaryColor }}>
          <div>
            <h2 className="text-white font-bold text-lg">
              {mode === 'login'
                ? (lang === 'en' ? 'Welcome Back' : 'স্বাগতম')
                : (lang === 'en' ? 'Create Account' : 'অ্যাকাউন্ট তৈরি করুন')}
            </h2>
            <p className="text-white/70 text-xs mt-0.5">{shop.name}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {success && (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-green-600 font-medium text-sm">
                {lang === 'en' ? 'Logged in successfully!' : 'সফলভাবে লগইন হয়েছে!'}
              </p>
            </div>
          )}

          {!success && (
            <>
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {lang === 'en' ? 'Full Name' : 'পুরো নাম'} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={lang === 'en' ? 'Your full name' : 'আপনার পুরো নাম'}
                      className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                      style={{ borderRadius: radius, '--tw-ring-color': shop.theme.primaryColor } as any}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {lang === 'en' ? 'Phone Number' : 'ফোন নম্বর'} *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{ borderRadius: radius } as any}
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {lang === 'en' ? 'Email (optional)' : 'ইমেইল (ঐচ্ছিক)'}
                  </label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{ borderRadius: radius } as any}
                  />
                </div>
              )}

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                type="submit"
                className="w-full py-2.5 text-white font-semibold text-sm rounded-xl transition-opacity hover:opacity-90"
                style={{ backgroundColor: shop.theme.primaryColor, borderRadius: radius }}
              >
                {mode === 'login'
                  ? (lang === 'en' ? 'Login' : 'লগইন')
                  : (lang === 'en' ? 'Create Account' : 'অ্যাকাউন্ট তৈরি করুন')}
              </button>

              <p className="text-center text-xs text-gray-500">
                {mode === 'login'
                  ? (lang === 'en' ? "Don't have an account?" : 'অ্যাকাউন্ট নেই?')
                  : (lang === 'en' ? 'Already have an account?' : 'ইতিমধ্যে অ্যাকাউন্ট আছে?')}{' '}
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                  className="font-semibold hover:underline"
                  style={{ color: shop.theme.primaryColor }}
                >
                  {mode === 'login'
                    ? (lang === 'en' ? 'Register' : 'নিবন্ধন করুন')
                    : (lang === 'en' ? 'Login' : 'লগইন')}
                </button>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
