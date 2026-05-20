import { createFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCart, TrendingUp, ArrowRight, Tag, Flame, Play, ChevronLeft, ChevronRight, Star, ExternalLink, Phone, Trophy } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAdminStore, ALL_CATEGORIES, SUBCATEGORIES_BY_CATEGORY, fmt, effectivePrice, discountBadgeText, hasProductDiscount } from '@/lib/admin-store'
import { productYoutubeId, productFacebookPageUrl } from '@/lib/social-embed'
import { useShopCart } from '@/lib/shop-cart'
import { useI18n } from '@/lib/i18n'

/* ─── Generic Festival Covers ─────────────────────────────── */
const FESTIVALS = [
  {
    id: 'eid_fitr',
    name: 'Eid-ul-Fitr Sale', nameBn: 'ঈদুল ফিতর সেল',
    headline: 'Big Eid Fashion Sale', headlineBn: 'ঈদের বড় ফ্যাশন সেল',
    sub: 'Exclusive gents & ladies collection — upto 50% off!', subBn: 'এক্সক্লুসিভ কালেকশন — ৫০% পর্যন্ত ছাড়!',
    grad: ['#0d4f3c', '#1a6b50'], accent: '#ffd700',
    icons: ['🌙', '⭐', '🕌', '✨', '🎁', '🌙', '⭐', '✨'],
  },
  {
    id: 'puja',
    name: 'Puja Festival Sale', nameBn: 'পূজা উৎসব সেল',
    headline: 'Durga Puja Collection — Grand Offers!', headlineBn: 'দুর্গাপূজা কালেকশন — গ্র্যান্ড অফার!',
    sub: 'Saree, salwar, jewelry & beauty deals', subBn: 'শাড়ি, সালোয়ার, গহনা ও বিউটি অফার',
    grad: ['#7c2d12', '#b45309'], accent: '#ffa500',
    icons: ['🪔', '🌸', '🎊', '💫', '🏵️', '🪔', '✨', '🌺'],
  },
  {
    id: 'boishakh',
    name: 'Pohela Boishakh', nameBn: 'পহেলা বৈশাখ',
    headline: 'Happy Bengali New Year!', headlineBn: 'শুভ নববর্ষ!',
    sub: 'Fresh collection — traditional & modern styles', subBn: 'নতুন কালেকশন — ঐতিহ্যিক ও আধুনিক স্টাইল',
    grad: ['#7f1d1d', '#b91c1c'], accent: '#fef3c7',
    icons: ['🎨', '🌺', '🎭', '🎵', '🌸', '🌺', '✨', '🎶'],
  },
  {
    id: 'eid_adha',
    name: 'Eid-ul-Adha Sale', nameBn: 'ঈদুল আযহা সেল',
    headline: 'Qurbani Eid — Special Deals!', headlineBn: 'কুরবানি ঈদ — বিশেষ অফার!',
    sub: 'Premium panjabi, sherwani & accessories', subBn: 'প্রিমিয়াম পাঞ্জাবি, শেরওয়ানি ও আনুষাঙ্গিক',
    grad: ['#78350f', '#c2820a'], accent: '#fde68a',
    icons: ['🌙', '🐑', '⭐', '🎊', '✨', '🌙', '🎁', '⭐'],
  },
  {
    id: 'summer',
    name: 'Summer Sale', nameBn: 'গ্রীষ্মকালীন সেল',
    headline: 'Summer Collection — Cool Styles!', headlineBn: 'সামার কালেকশন — কুল স্টাইল!',
    sub: 'Light & breezy — perfect for Bangladesh heat', subBn: 'হালকা ও আরামদায়ক — বাংলাদেশের গরমের জন্য',
    grad: ['#0c4a6e', '#0369a1'], accent: '#7dd3fc',
    icons: ['☀️', '🌊', '🌴', '⛱️', '🌞', '☀️', '💦', '🌈'],
  },
  {
    id: 'winter',
    name: 'Winter Collection', nameBn: 'শীতকালীন কালেকশন',
    headline: 'Winter Warmth — New Arrivals!', headlineBn: 'শীতের উষ্ণতা — নতুন কালেকশন!',
    sub: 'Stay warm & stylish this winter', subBn: 'এই শীতে উষ্ণ ও স্টাইলিশ থাকুন',
    grad: ['#1e1b4b', '#1e3a5f'], accent: '#93c5fd',
    icons: ['❄️', '🧣', '⛄', '🌨️', '🔥', '❄️', '🧤', '⛄'],
  },
]

/* ─── Mood On Exclusive Covers ─────────────────────────────── */
const MOOD_ON_COVERS = [
  {
    id: 'mood_street',
    name: 'Street Fashion BD', nameBn: 'স্ট্রিট ফ্যাশন বিডি',
    headline: 'Street Fashion — Feel the Vibe', headlineBn: 'স্ট্রিট ফ্যাশন — নিজেকে প্রকাশ করুন',
    sub: "A clothing line influenced by street fashion and urban styling in Bangladesh.", subBn: 'বাংলাদেশের শহুরে স্টাইল থেকে অনুপ্রাণিত পোশাক লাইন।',
    grad: ['#0a0a0a', '#1a1a2e'], accent: '#c9a84c',
    icons: ['👕', '🏙️', '👟', '✨', '🌆', '👗', '💫', '🎭'],
    isMoodOn: true,
    patternType: 'dots',
  },
  {
    id: 'mood_gold',
    name: 'Gold Edition', nameBn: 'গোল্ড এডিশন',
    headline: 'Gold Edition — Premium Style', headlineBn: 'গোল্ড এডিশন — প্রিমিয়াম স্টাইল',
    sub: "Shop the latest trends in men's, women's & children's clothing.", subBn: 'গেন্টস, লেডিস ও শিশুদের সর্বশেষ কালেকশন এখন পাওয়া যাচ্ছে।',
    grad: ['#1a1a2e', '#0f0c29'], accent: '#ffd700',
    icons: ['👑', '✨', '💛', '🌟', '💫', '🔱', '⚜️', '🏆'],
    isMoodOn: true,
    patternType: 'grid',
  },
]

export const Route = createFileRoute('/shop/$slug/')({
  component: ShopHomePage,
})

function ShopHomePage() {
  const { slug } = Route.useParams()
  const { shops, products } = useAdminStore()
  const { addItem, forceAddFromShop } = useShopCart()
  const { lang } = useI18n()
  const [conflictProduct, setConflictProduct] = useState<any>(null)
  const [addedId, setAddedId] = useState<string | null>(null)
  const [festIdx, setFestIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null)

  const shop = shops.find(s => s.slug === slug)!
  const allShopProducts = products.filter(p => p.shopId === shop.id && p.status === 'active' && shop.allowedCategories.includes(p.categoryId))
  const activeSubcats = shop.allowedCategories
    .flatMap(cid => SUBCATEGORIES_BY_CATEGORY[cid] ?? [])
    .filter(sub => allShopProducts.some(p => p.subcategoryId === sub.id))
  const shopProducts = selectedSubcat
    ? allShopProducts.filter(p => p.subcategoryId === selectedSubcat)
    : allShopProducts
  const cats = shop.allowedCategories.map(id => ALL_CATEGORIES.find(c => c.id === id)).filter(Boolean)
  const radiusMap = { sharp: '8px', medium: '16px', rounded: '24px' }
  const radius = radiusMap[shop.theme.borderRadius]

  // Mood On gets its own covers, others get festivals
  const isMoodOn = shop.id === 'shop_5'
  const COVERS = isMoodOn ? [...MOOD_ON_COVERS, ...FESTIVALS] : FESTIVALS
  const fest = COVERS[festIdx] as typeof COVERS[0]

  // Set initial cover based on activeCoverId
  useEffect(() => {
    if (shop.activeCoverId) {
      const idx = COVERS.findIndex(c => c.id === shop.activeCoverId)
      if (idx !== -1) setFestIdx(idx)
    }
  }, [shop.activeCoverId])

  const goTo = useCallback((idx: number) => {
    setFading(true)
    setTimeout(() => { setFestIdx(idx); setFading(false) }, 350)
  }, [])

  useEffect(() => {
    if (shop.activeCoverId) return
    const t = setInterval(() => goTo((festIdx + 1) % COVERS.length), 5000)
    return () => clearInterval(t)
  }, [festIdx, goTo, COVERS.length, shop.activeCoverId])

  function handleAddToCart(product: typeof shopProducts[0]) {
    const result = addItem({ productId: product.id, shopId: shop.id, name: product.name, price: effectivePrice(product), image: product.images?.[0] ?? product.image })
    if (result === 'shop_conflict') { setConflictProduct(product); return }
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1400)
  }

  const activeSale = shop.activeSale
  const saleProducts = activeSale
    ? shopProducts.filter(p => !activeSale.productIds.length || activeSale.productIds.includes(p.id))
    : []

  const popularProducts = [...shopProducts].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)).slice(0, 4)

  const isMoodOnCover = (fest as any).isMoodOn
  const patternType = (fest as any).patternType ?? 'dots'

  return (
    <div>
      <style>{`
        @keyframes floatUp {
          0%,100%{transform:translateY(0) rotate(0deg) scale(1);}
          33%{transform:translateY(-22px) rotate(10deg) scale(1.1);}
          66%{transform:translateY(-10px) rotate(-6deg) scale(1.05);}
        }
        @keyframes slideUp {
          from{opacity:0;transform:translateY(28px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes ticker {
          from{transform:translateX(100vw);}
          to{transform:translateX(-100%);}
        }
        @keyframes salePulse {
          0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(239,68,68,.5);}
          50%{transform:scale(1.05);box-shadow:0 0 0 10px rgba(239,68,68,0);}
        }
        @keyframes goldGlow {
          0%,100%{box-shadow:0 0 15px rgba(201,168,76,.4);}
          50%{box-shadow:0 0 35px rgba(201,168,76,.8), 0 0 60px rgba(201,168,76,.3);}
        }
        @keyframes goldShimmer {
          0%{background-position:-200% center;}
          100%{background-position:200% center;}
        }
        @keyframes bounceDot {
          0%,100%{transform:translateY(0);}
          50%{transform:translateY(-5px);}
        }
        @keyframes zoomIn {
          from{transform:scale(1);}
          to{transform:scale(1.28);}
        }
        .float-icon{animation:floatUp var(--dur,4s) ease-in-out var(--delay,0s) infinite;}
        .slide-up{animation:slideUp 0.55s cubic-bezier(.22,1,.36,1) forwards;}
        .sale-pulse{animation:salePulse 2.2s ease-in-out infinite;}
        .ticker-wrap{animation:ticker 22s linear infinite;}
        .bounce-dot{animation:bounceDot 1.4s ease-in-out infinite;}
        .gold-glow{animation:goldGlow 2.5s ease-in-out infinite;}
        .gold-text{
          background: linear-gradient(90deg, #c9a84c, #ffd700, #e8c76a, #c9a84c);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: goldShimmer 3s linear infinite;
        }
        /* Product zoom */
        .product-img-wrap{overflow:hidden;}
        .product-img-hover{transition:transform 0.5s cubic-bezier(.22,1,.36,1);}
        .product-card:hover .product-img-hover{transform:scale(1.28);}
        .product-card{transition:box-shadow 0.3s, transform 0.3s;}
        .product-card:hover{box-shadow:0 20px 40px -8px rgba(0,0,0,.18);transform:translateY(-4px);}
        .cart-btn{transition:background 0.2s,transform 0.15s,box-shadow 0.2s;}
        .cart-btn:active{transform:scale(0.96);}
        /* Quick view on hover */
        .quick-view{opacity:0;transform:translateY(8px);transition:all 0.25s ease;}
        .product-card:hover .quick-view{opacity:1;transform:translateY(0);}
      `}</style>

      {/* ━━━ Animated Hero Cover ━━━ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${fest.grad[0]}, ${fest.grad[1]})`,
          minHeight: isMoodOnCover ? 420 : 360,
          transition: 'background 0.6s ease',
        }}
      >
        {/* Background pattern */}
        {isMoodOnCover && patternType === 'dots' && (
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        )}
        {isMoodOnCover && patternType === 'grid' && (
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        )}

        {/* Floating icons */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          {fest.icons.map((icon, i) => (
            <span
              key={`${fest.id}-${i}`}
              className="absolute text-2xl sm:text-4xl float-icon select-none"
              style={{
                left: `${5 + i * 12}%`,
                top: `${8 + (i % 4) * 22}%`,
                '--dur': `${3.5 + i * 0.6}s`,
                '--delay': `${i * 0.35}s`,
                opacity: isMoodOnCover ? 0.2 : 0.3,
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.4))',
              } as React.CSSProperties}
            >
              {icon}
            </span>
          ))}
        </div>

        {/* Hero content */}
        <div className={`relative z-10 container mx-auto px-4 py-12 md:py-20 transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex-1 max-w-xl">

              {/* Mood On logo in cover */}
              {isMoodOnCover && shop.logo && (
                <div className="mb-5">
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    className="w-16 h-16 rounded-2xl object-cover shadow-2xl gold-glow"
                    style={{ border: `2px solid ${fest.accent}60` }}
                  />
                </div>
              )}

              {/* Cover badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 border"
                style={{ backgroundColor: fest.accent + '25', color: fest.accent, borderColor: fest.accent + '50' }}
              >
                <span className="bounce-dot inline-block text-sm">{fest.icons[0]}</span>
                {lang === 'en' ? fest.name : fest.nameBn}
              </div>

              <h1
                key={`${fest.id}-h-${lang}`}
                className={`slide-up text-3xl sm:text-5xl font-bold leading-tight mb-2 ${isMoodOnCover ? 'gold-text' : 'text-white'}`}
              >
                {lang === 'en' ? fest.headline : fest.headlineBn}
              </h1>

              <p className="text-white/65 text-sm sm:text-base mb-7 max-w-md leading-relaxed">
                {lang === 'en' ? fest.sub : fest.subBn}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/shop/$slug/products"
                  params={{ slug }}
                  className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 hover:opacity-90 transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: fest.accent, color: isMoodOnCover ? '#0a0a0a' : fest.grad[0], borderRadius: radius }}
                >
                  {lang === 'en' ? 'Shop Now' : 'এখনই কিনুন'} <ArrowRight className="w-4 h-4" />
                </Link>
                {activeSale && (
                  <button
                    className="inline-flex items-center gap-1.5 px-5 py-3 text-sm font-bold text-white rounded-xl sale-pulse cursor-default"
                    style={{ backgroundColor: '#dc2626', borderRadius: radius }}
                  >
                    <Flame className="w-4 h-4" />
                    {lang === 'en'
                      ? `${activeSale.discountPercent}% OFF — SALE LIVE!`
                      : `${activeSale.discountPercent}% ছাড় চলছে!`}
                  </button>
                )}
              </div>

              {/* Mood On social + phone links in cover */}
              {isMoodOnCover && (shop.facebookPageUrl || shop.contactPhone) && (
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  {shop.contactPhone && (
                    <a href={`tel:${shop.contactPhone}`} className="flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                      {shop.contactPhone}
                    </a>
                  )}
                  {shop.facebookPageUrl && (
                    <a href={shop.facebookPageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      {lang === 'en' ? 'Facebook Page' : 'ফেসবুক পেজ'}
                    </a>
                  )}
                  {shop.facebookGroupUrl && (
                    <a href={shop.facebookGroupUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      {lang === 'en' ? 'Join Group' : 'গ্রুপে যোগ দিন'}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Mood On special right panel */}
            {isMoodOnCover && (
              <div className="hidden md:flex flex-col items-center gap-3 mr-8">
                <div
                  className="text-6xl font-black text-center leading-none select-none gold-text"
                  style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-2px' }}
                >
                  MOOD<br />ON
                </div>
                <div className="text-xs text-center" style={{ color: fest.accent + 'aa' }}>
                  {lang === 'en' ? `Since ${shop.createdAt?.slice(0, 4)}` : `${shop.createdAt?.slice(0, 4)} থেকে`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {COVERS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === festIdx ? 22 : 8, height: 8,
                backgroundColor: i === festIdx ? fest.accent : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>

        {/* Prev/Next arrows */}
        <button
          onClick={() => goTo((festIdx - 1 + COVERS.length) % COVERS.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => goTo((festIdx + 1) % COVERS.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ━━━ Broadcast / Sale ticker ━━━ */}
      {(shop.broadcast?.active || activeSale) && (
        <div className="bg-red-600 text-white py-2 overflow-hidden relative">
          <div className="ticker-wrap whitespace-nowrap text-xs sm:text-sm font-bold inline-block">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="mx-10">
                {shop.broadcast?.active
                  ? shop.broadcast.text
                  : activeSale
                    ? `🔥 ${lang === 'en' ? activeSale.name : activeSale.nameBn} — ${activeSale.discountPercent}% ${lang === 'en' ? 'OFF' : 'ছাড়'}! ⚡ ${lang === 'en' ? 'Limited time offer!' : 'সীমিত সময়ের অফার!'} 🛍️ ${lang === 'en' ? 'Shop now!' : 'এখনই কিনুন!'}`
                    : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-10 space-y-14">

        {/* ━━━ Categories grid ━━━ */}
        {cats.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'Shop by Category' : 'ক্যাটাগরি অনুযায়ী কেনাকাটা'}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {cats.map(cat => cat && (
                <Link
                  key={cat.id}
                  to="/shop/$slug/products"
                  params={{ slug }}
                  className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all hover:-translate-y-1 text-center"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-xs font-medium text-gray-700 leading-tight">{lang === 'en' ? cat.name : cat.nameBn}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ━━━ Subcategory filters ━━━ */}
        {activeSubcats.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {lang === 'en' ? 'Filter by' : 'ফিল্টার'}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubcat(null)}
                className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                style={!selectedSubcat
                  ? { backgroundColor: shop.theme.primaryColor, color: '#fff', borderColor: shop.theme.primaryColor }
                  : { borderColor: '#e5e7eb', color: '#6b7280' }}
              >
                {lang === 'en' ? 'All' : 'সব'}
              </button>
              {activeSubcats.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcat(selectedSubcat === sub.id ? null : sub.id)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                  style={selectedSubcat === sub.id
                    ? { backgroundColor: shop.theme.primaryColor, color: '#fff', borderColor: shop.theme.primaryColor }
                    : { borderColor: '#e5e7eb', color: '#6b7280' }}
                >
                  {lang === 'en' ? sub.name : sub.nameBn}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ━━━ Active Big Sale section ━━━ */}
        {activeSale && saleProducts.length > 0 && (
          <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-5 sm:p-7 border border-red-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center sale-pulse">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    {lang === 'en' ? activeSale.name : activeSale.nameBn}
                  </h2>
                  <p className="text-xs text-red-600 font-semibold">
                    {activeSale.discountPercent}% {lang === 'en' ? 'OFF — Limited Time!' : 'ছাড় — সীমিত সময়!'}
                  </p>
                </div>
              </div>
              <Link to="/shop/$slug/products" params={{ slug }} className="text-xs sm:text-sm font-medium flex items-center gap-1 text-red-600 hover:underline">
                {lang === 'en' ? 'View All' : 'সব দেখুন'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {saleProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} shop={shop} slug={slug} radius={radius} lang={lang} addedId={addedId} onAddToCart={handleAddToCart} highlight />
              ))}
            </div>
          </section>
        )}

        {/* ━━━ Most Popular ━━━ */}
        {popularProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {lang === 'en' ? 'Most Popular' : 'সবচেয়ে জনপ্রিয়'}
                </h2>
              </div>
              <Link to="/shop/$slug/products" params={{ slug }} className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: shop.theme.primaryColor }}>
                {lang === 'en' ? 'View All' : 'সব দেখুন'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {popularProducts.map((product, idx) => {
                const rankEmoji = ['🥇', '🥈', '🥉', '4️⃣'][idx]
                return (
                  <div key={product.id} className="relative">
                    <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-amber-400 text-white text-sm font-bold flex items-center justify-center shadow-md border-2 border-white">
                      {rankEmoji}
                    </div>
                    <ProductCard product={product} shop={shop} slug={slug} radius={radius} lang={lang} addedId={addedId} onAddToCart={handleAddToCart} />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ━━━ Featured products ━━━ */}
        {shopProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: shop.theme.primaryColor }} />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {lang === 'en' ? 'Featured Products' : 'বিশেষ পণ্য'}
                </h2>
              </div>
              <Link to="/shop/$slug/products" params={{ slug }} className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: shop.theme.primaryColor }}>
                {lang === 'en' ? 'View All' : 'সব দেখুন'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {shopProducts.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} shop={shop} slug={slug} radius={radius} lang={lang} addedId={addedId} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </section>
        )}

        {shopProducts.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">{lang === 'en' ? 'No products yet' : 'এখনো কোনো পণ্য নেই'}</p>
          </div>
        )}

        {/* ━━━ Stats strip ━━━ */}
        <div className="rounded-2xl p-6 sm:p-8 grid grid-cols-3 gap-4" style={{ background: `linear-gradient(135deg, ${shop.theme.primaryColor}18, ${shop.theme.accentColor}12)` }}>
          {[
            { label: lang === 'en' ? 'Products' : 'পণ্য', value: shopProducts.length || shop.stats.products },
            { label: lang === 'en' ? 'Orders' : 'অর্ডার', value: shop.stats.orders.toLocaleString() },
            { label: lang === 'en' ? 'Happy Customers' : 'সন্তুষ্ট গ্রাহক', value: `${(shop.stats.customers / 1000).toFixed(1)}K+` },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold" style={{ color: shop.theme.primaryColor }}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ━━━ Since / motto strip ━━━ */}
        <div className="text-center py-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {lang === 'en'
              ? `${shop.name} — Trusted since ${shop.createdAt?.slice(0, 4)}`
              : `${shop.name} — ${shop.createdAt?.slice(0, 4)} সাল থেকে বিশ্বস্ত`}
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
          {shop.motto && (
            <p className="text-xs text-gray-400 italic max-w-lg mx-auto leading-relaxed">"{shop.motto}"</p>
          )}
          {shop.address && <p className="text-xs text-gray-300 mt-2">📍 {shop.address}</p>}
          <div className="flex items-center justify-center gap-4 mt-3">
            {shop.contactPhone && (
              <a href={`tel:${shop.contactPhone}`} className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {shop.contactPhone}
              </a>
            )}
            {shop.facebookPageUrl && (
              <a href={shop.facebookPageUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline" style={{ color: '#1877F2' }}>FB Page</a>
            )}
            {shop.facebookGroupUrl && (
              <a href={shop.facebookGroupUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline" style={{ color: '#1877F2' }}>FB Group</a>
            )}
          </div>
        </div>
      </div>

      {/* Conflict dialog */}
      {conflictProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2">{lang === 'en' ? 'Different Shop' : 'ভিন্ন শপ'}</h3>
            <p className="text-sm text-gray-600 mb-5">
              {lang === 'en' ? 'Your cart has items from another shop. Clear cart to add from here?' : 'আপনার কার্টে অন্য শপের পণ্য আছে।'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConflictProduct(null)} className="flex-1 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50" style={{ borderRadius: radius }}>
                {lang === 'en' ? 'Keep Cart' : 'কার্ট রাখুন'}
              </button>
              <button
                onClick={() => { forceAddFromShop({ productId: conflictProduct.id, shopId: shop.id, name: conflictProduct.name, price: effectivePrice(conflictProduct), image: conflictProduct.images?.[0] ?? conflictProduct.image }); setConflictProduct(null) }}
                className="flex-1 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
                style={{ backgroundColor: shop.theme.primaryColor, borderRadius: radius }}
              >
                {lang === 'en' ? 'Start Fresh' : 'নতুন শুরু'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, shop, slug, radius, lang, addedId, onAddToCart, highlight }: any) {
  const isAdded = addedId === product.id
  const isOut = product.stock === 0
  const isLow = product.stock > 0 && product.stock <= product.lowStockThreshold
  const salePrice = effectivePrice(product)
  const discLabel = discountBadgeText(product, lang)
  const hasDisc = hasProductDiscount(product) && salePrice < product.price
  const displayImg = product.images?.[0] ?? product.image ?? ''
  const hasVideo = Boolean(productYoutubeId(product) || productFacebookPageUrl(product))

  return (
    <div className={`product-card bg-white rounded-2xl overflow-hidden ${highlight ? 'ring-2 ring-red-400/30 shadow-md' : 'shadow-sm'}`}>
      <Link to="/shop/$slug/product/$productId" params={{ slug, productId: product.id }} className="block">
        {/* Image with zoom */}
        <div className="product-img-wrap relative bg-gray-50" style={{ aspectRatio: '1/1' }}>
          <img
            src={displayImg}
            alt={product.name}
            className="product-img-hover w-full h-full"
            style={{ objectFit: 'contain', padding: '8px' }}
          />

          {/* Quick view overlay on hover */}
          <div className="quick-view absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-3 text-white text-xs font-medium">
            {lang === 'en' ? '👁 Quick View' : '👁 দেখুন'}
          </div>

          {isOut && (
            <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
              <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1 rounded-full">
                {lang === 'en' ? 'Out of Stock' : 'স্টক নেই'}
              </span>
            </div>
          )}
          {discLabel && !isOut && (
            <div className="absolute top-2 left-2">
              <span className="text-[11px] font-bold bg-red-600 text-white px-2 py-1 rounded-lg shadow">
                {discLabel}
              </span>
            </div>
          )}
          {isLow && !isOut && (
            <div className={`absolute ${discLabel ? 'top-2 right-2' : 'top-2 left-2'}`}>
              <span className="text-[10px] font-medium bg-amber-500 text-white px-2 py-0.5 rounded-full">
                {lang === 'en' ? `${product.stock} left` : `${product.stock}টি বাকি`}
              </span>
            </div>
          )}
          {hasVideo && !isOut && (
            <div className="absolute bottom-8 right-2 w-7 h-7 rounded-full bg-black/55 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug min-h-10">{product.name}</h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="font-bold text-base sm:text-lg" style={{ color: shop.theme.primaryColor }}>{fmt(salePrice)}</span>
            {hasDisc && <span className="text-xs text-gray-400 line-through">{fmt(product.price)}</span>}
            {hasDisc && discLabel && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">{discLabel}</span>}
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          disabled={isOut}
          onClick={() => onAddToCart(product)}
          className="cart-btn w-full py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 hover:shadow-md"
          style={{ backgroundColor: isAdded ? '#22c55e' : shop.theme.primaryColor, borderRadius: radius }}
        >
          {isAdded
            ? <><span className="text-base">✓</span>{lang === 'en' ? 'Added!' : 'যোগ হয়েছে!'}</>
            : <><ShoppingCart className="w-4 h-4" />{lang === 'en' ? 'Add to Cart' : 'কার্টে যোগ করুন'}</>}
        </button>
      </div>
    </div>
  )
}
