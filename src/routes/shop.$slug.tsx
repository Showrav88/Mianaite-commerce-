import { createFileRoute, Outlet, Link, useRouterState } from '@tanstack/react-router'
import { ShoppingCart, Search, Store, Globe, User, X, Menu, ChevronRight, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAdminStore, SUBCATEGORIES_BY_CATEGORY } from '@/lib/admin-store'
import { useShopCart } from '@/lib/shop-cart'
import { useI18n } from '@/lib/i18n'
import { useCustomerStore } from '@/lib/customer-store'
import ShopAuthModal from '@/components/shop/ShopAuthModal'

export const Route = createFileRoute('/shop/$slug')({
  component: ShopLayout,
})

function ShopLayout() {
  const { slug } = Route.useParams()
  const { shops, products } = useAdminStore()
  const { count } = useShopCart()
  const { lang, setLang } = useI18n()
  const { currentCustomer, logoutCustomer } = useCustomerStore()
  const [authOpen, setAuthOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = useRouterState({ select: s => s.location.pathname })

  const shop = shops.find(s => s.slug === slug)

  useEffect(() => {
    if (!shop) return

    const manifest = {
      name: shop.name,
      short_name: shop.name.split(' ')[0],
      description: shop.description || shop.name,
      start_url: `/shop/${shop.slug}`,
      scope: `/shop/${shop.slug}`,
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: shop.theme.primaryColor,
      orientation: 'portrait-primary',
      icons: shop.logo
        ? [
            { src: shop.logo, sizes: '192x192',  type: shop.logo.endsWith('.png') ? 'image/png' : 'image/jpeg', purpose: 'any' },
            { src: shop.logo, sizes: '512x512',  type: shop.logo.endsWith('.png') ? 'image/png' : 'image/jpeg', purpose: 'any maskable' },
          ]
        : [
            { src: '/shops/ait-logo.png', sizes: '192x192',  type: 'image/png', purpose: 'any' },
            { src: '/shops/ait-logo.png', sizes: '512x512',  type: 'image/png', purpose: 'any maskable' },
          ],
    }

    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' })
    const blobUrl = URL.createObjectURL(blob)

    let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null
    const prevHref = link?.href ?? '/manifest.json'
    if (!link) {
      link = document.createElement('link')
      link.rel = 'manifest'
      document.head.appendChild(link)
    }
    link.href = blobUrl

    // apple-touch-icon for iOS
    const apple = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null
    const prevApple = apple?.href ?? ''
    if (apple && shop.logo) apple.href = shop.logo

    return () => {
      URL.revokeObjectURL(blobUrl)
      if (link) link.href = prevHref
      if (apple) apple.href = prevApple
    }
  }, [shop])

  if (!shop || shop.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Shop Not Found</h1>
          <p className="text-gray-500 mb-6">This shop doesn't exist or is currently unavailable.</p>
          <Link to="/shops" className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
            Browse All Shops
          </Link>
        </div>
      </div>
    )
  }

  const radiusMap = { sharp: '8px', medium: '16px', rounded: '24px' }
  const radius = radiusMap[shop.theme.borderRadius]
  const fontMap = { Inter: "'Inter', sans-serif", Poppins: "'Poppins', sans-serif", Roboto: "'Roboto', sans-serif" }
  const font = fontMap[shop.theme.fontFamily]

  const shopActiveProducts = products.filter(p => p.shopId === shop.id && p.status === 'active')
  const menuSubcats = shop.allowedCategories.flatMap(cid => SUBCATEGORIES_BY_CATEGORY[cid] ?? []).filter(sub => shopActiveProducts.some(p => p.subcategoryId === sub.id))

  const isHome = pathname === `/shop/${slug}`

  return (
    <div style={{ fontFamily: font }} className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-sm" style={{ backgroundColor: shop.theme.primaryColor }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 h-14">
            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(true)} className="md:hidden text-white/80 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link to="/shop/$slug" params={{ slug }} className="flex items-center gap-2 shrink-0">
              {shop.logo ? (
                <img src={shop.logo} alt={shop.name} className="w-8 h-8 rounded-lg object-cover bg-white/10" />
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{shop.name.charAt(0)}</span>
                </div>
              )}
              <span className="text-white font-bold text-base hidden sm:block">{shop.name}</span>
            </Link>

            {/* Nav links — desktop */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <Link
                to="/shop/$slug"
                params={{ slug }}
                className="text-white/80 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ borderRadius: radius }}
              >
                {lang === 'en' ? 'Home' : 'হোম'}
              </Link>
              <Link
                to="/shop/$slug/products"
                params={{ slug }}
                className="text-white/80 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ borderRadius: radius }}
              >
                {lang === 'en' ? 'Products' : 'পণ্য'}
              </Link>
              <Link
                to="/shop/$slug/about"
                params={{ slug }}
                className="text-white/80 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ borderRadius: radius }}
              >
                {lang === 'en' ? 'About' : 'আমাদের'}
              </Link>
            </nav>

            {/* Search — desktop */}
            <div className="hidden md:flex flex-1 max-w-sm mx-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                placeholder={lang === 'en' ? 'Search products...' : 'পণ্য খুঁজুন...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/15 border border-white/20 text-white text-sm placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all"
                style={{ borderRadius: radius }}
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Language */}
              <button
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                className="flex items-center gap-1 text-white/70 hover:text-white text-xs transition-colors px-2 py-1.5 rounded-lg hover:bg-white/10"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'বাং' : 'EN'}</span>
              </button>

              {/* Auth */}
              {currentCustomer && currentCustomer.shopId === shop.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-xs hidden sm:block">{currentCustomer.name.split(' ')[0]}</span>
                  <button
                    onClick={() => logoutCustomer()}
                    className="text-white/70 hover:text-white text-xs px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {lang === 'en' ? 'Logout' : 'বের হন'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  style={{ borderRadius: radius }}
                >
                  <User className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Login' : 'লগইন'}
                </button>
              )}

              {/* Cart */}
              <Link
                to="/shop/$slug/checkout"
                params={{ slug }}
                className="relative flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                style={{ borderRadius: radius }}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:block">{lang === 'en' ? 'Cart' : 'কার্ট'}</span>
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-[10px] font-bold flex items-center justify-center rounded-full" style={{ color: shop.theme.primaryColor }}>
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                placeholder={lang === 'en' ? 'Search products...' : 'পণ্য খুঁজুন...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/15 border border-white/20 text-white text-sm placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b" style={{ backgroundColor: shop.theme.primaryColor }}>
              <span className="text-white font-bold">{shop.name}</span>
              <button onClick={() => setMenuOpen(false)} className="text-white/80"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              <Link
                to="/shop/$slug"
                params={{ slug }}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
                {lang === 'en' ? 'Home' : 'হোম'}
              </Link>

              {/* Products — expandable */}
              <div>
                <button
                  onClick={() => setProductsOpen(o => !o)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-left">{lang === 'en' ? 'Products' : 'পণ্য'}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
                </button>
                {productsOpen && (
                  <div className="ml-7 mt-0.5 space-y-0.5">
                    <Link
                      to="/shop/$slug/products"
                      params={{ slug }}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 text-xs font-medium transition-colors"
                    >
                      {lang === 'en' ? 'All Products' : 'সব পণ্য'}
                    </Link>
                    {menuSubcats.map(sub => (
                      <Link
                        key={sub.id}
                        to="/shop/$slug/products"
                        params={{ slug }}
                        search={{ sub: sub.id }}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 text-xs font-medium transition-colors"
                      >
                        {lang === 'en' ? sub.name : sub.nameBn}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/shop/$slug/about"
                params={{ slug }}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
                {lang === 'en' ? 'About' : 'আমাদের'}
              </Link>
            </nav>
            <div className="px-4 py-4 border-t text-xs text-gray-400 text-center">
              <p className="font-medium" style={{ color: shop.theme.accentColor }}>{shop.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb (non-home) */}
      {!isHome && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-2 flex items-center gap-2 text-xs text-gray-500">
            <Link to="/shop/$slug" params={{ slug }} className="hover:text-gray-700 font-medium">{shop.name}</Link>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Page content */}
      <Outlet />

      {/* Footer */}
      <footer className="mt-16 border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: shop.theme.primaryColor }}>
                <span className="text-white font-bold text-xs">{shop.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{shop.name}</p>
                <p className="text-[11px] text-gray-400">{shop.description}</p>
              </div>
            </div>
            <div className="text-xs text-gray-400 text-center space-y-1">
              {shop.contactPhone && <p>📞 {shop.contactPhone}</p>}
              {shop.contactEmail && <p>{shop.contactEmail}</p>}
              <div className="flex items-center justify-center gap-3 mt-1">
                {shop.facebookPageUrl && (
                  <a href={shop.facebookPageUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 font-medium" style={{ color: '#1877F2' }}>Facebook Page</a>
                )}
                {shop.facebookGroupUrl && (
                  <a href={shop.facebookGroupUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 font-medium" style={{ color: '#1877F2' }}>Group</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth modal */}
      {authOpen && <ShopAuthModal shop={shop} radius={radius} onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
