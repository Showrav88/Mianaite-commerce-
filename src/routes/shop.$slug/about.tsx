import { createFileRoute, Link } from '@tanstack/react-router'
import { Phone, Mail, MapPin, ExternalLink, Users, Store, Clock } from 'lucide-react'
import { useAdminStore } from '@/lib/admin-store'
import { useI18n } from '@/lib/i18n'

export const Route = createFileRoute('/shop/$slug/about')({
  component: ShopAboutPage,
})

function ShopAboutPage() {
  const { slug } = Route.useParams()
  const { shops } = useAdminStore()
  const { lang } = useI18n()

  const shop = shops.find(s => s.slug === slug)!
  const radiusMap = { sharp: '8px', medium: '16px', rounded: '24px' }
  const radius = radiusMap[shop.theme.borderRadius]
  const primary = shop.theme.primaryColor
  const accent = shop.theme.accentColor

  const since = shop.createdAt ? new Date(shop.createdAt).getFullYear() : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Hero brand block */}
      <div
        className="rounded-3xl p-8 text-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}cc 60%, #000 100%)` }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 80%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10">
          {shop.logo && (
            <img src={shop.logo} alt={shop.name} className="w-24 h-24 mx-auto rounded-2xl object-cover mb-4 shadow-xl" style={{ border: `2px solid ${accent}60` }} />
          )}
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{shop.name}</h1>
          {since && (
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3" style={{ backgroundColor: accent + '30', color: accent }}>
              {lang === 'en' ? `Est. ${since}` : `${since} সাল থেকে`}
            </span>
          )}
          {shop.motto && (
            <p className="text-white/70 text-sm max-w-md mx-auto leading-relaxed italic">"{shop.motto}"</p>
          )}
        </div>
      </div>

      {/* Contact cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {shop.contactPhone && (
          <a href={`tel:${shop.contactPhone}`} className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: primary + '18' }}>
              <Phone className="w-5 h-5" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{lang === 'en' ? 'Phone' : 'ফোন'}</p>
              <p className="font-semibold text-gray-900 text-sm">{shop.contactPhone}</p>
            </div>
          </a>
        )}

        {shop.contactEmail && (
          <a href={`mailto:${shop.contactEmail}`} className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: primary + '18' }}>
              <Mail className="w-5 h-5" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{lang === 'en' ? 'Email' : 'ইমেইল'}</p>
              <p className="font-semibold text-gray-900 text-sm truncate">{shop.contactEmail}</p>
            </div>
          </a>
        )}

        {shop.address && (
          <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: primary + '18' }}>
              <MapPin className="w-5 h-5" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{lang === 'en' ? 'Address' : 'ঠিকানা'}</p>
              <p className="font-semibold text-gray-900 text-sm">{shop.address}</p>
            </div>
          </div>
        )}

        {since && (
          <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: primary + '18' }}>
              <Clock className="w-5 h-5" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{lang === 'en' ? 'Established' : 'প্রতিষ্ঠিত'}</p>
              <p className="font-semibold text-gray-900 text-sm">{lang === 'en' ? `Since ${since}` : `${since} সাল থেকে`}</p>
            </div>
          </div>
        )}
      </div>

      {/* Social media */}
      {(shop.facebookPageUrl || shop.facebookGroupUrl) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span style={{ color: primary }}>📲</span>
            {lang === 'en' ? 'Follow Us' : 'আমাদের ফলো করুন'}
          </h2>
          <div className="space-y-3">
            {shop.facebookPageUrl && (
              <a
                href={shop.facebookPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ borderColor: '#1877F2' + '40', backgroundColor: '#1877F2' + '08' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm" style={{ backgroundColor: '#1877F2' }}>f</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{lang === 'en' ? 'Facebook Page' : 'ফেসবুক পেজ'}</p>
                  <p className="text-xs text-gray-400 truncate">{shop.facebookPageUrl}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
              </a>
            )}
            {shop.facebookGroupUrl && (
              <a
                href={shop.facebookGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ borderColor: '#1877F2' + '40', backgroundColor: '#1877F2' + '08' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: '#1877F2' }}>
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{lang === 'en' ? 'Facebook Group' : 'ফেসবুক গ্রুপ'}</p>
                  <p className="text-xs text-gray-400">{lang === 'en' ? 'Join our community' : 'আমাদের কমিউনিটিতে যোগ দিন'}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Google Maps */}
      {slug === 'mood-on' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: primary }} />
            <h2 className="font-bold text-gray-900">{lang === 'en' ? 'Find Us' : 'আমাদের খুঁজুন'}</h2>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3674.2617614092715!2d90.8254863749092!3d22.940584979231232!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3754c3d7940ef11b%3A0x6a0f46879c0c7a30!2sMood%20On!5e0!3m2!1sen!2sbd!4v1779288529424!5m2!1sen!2sbd"
            width="100%"
            height="300"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mood On Location"
          />
        </div>
      )}

      {/* Shop description */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Store className="w-4 h-4" style={{ color: primary }} />
          <h2 className="font-bold text-gray-900">{lang === 'en' ? 'About the Shop' : 'শপ সম্পর্কে'}</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{shop.description}</p>
      </div>

      {/* Back to products */}
      <div className="text-center">
        <Link
          to="/shop/$slug/products"
          params={{ slug }}
          className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: primary, borderRadius: radius }}
        >
          {lang === 'en' ? '🛍️ Shop Now' : '🛍️ এখনই কিনুন'}
        </Link>
      </div>
    </div>
  )
}
