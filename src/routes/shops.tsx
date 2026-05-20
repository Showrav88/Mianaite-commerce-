import { createFileRoute, Link } from '@tanstack/react-router'
import { Search, Store, ArrowRight, Globe } from 'lucide-react'
import { useState } from 'react'
import { useAdminStore, ALL_CATEGORIES } from '@/lib/admin-store'
import { useI18n } from '@/lib/i18n'

export const Route = createFileRoute('/shops')({
  component: ShopsDirectoryPage,
  head: () => ({ meta: [{ title: 'All Shops — AITeShops' }] }),
})

function ShopsDirectoryPage() {
  const { shops, products } = useAdminStore()
  const { lang, setLang } = useI18n()
  const [search, setSearch] = useState('')

  const activeShops = shops
    .filter(s => s.status === 'active')
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-br from-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="flex justify-between items-start mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">AITeShops</span>
            </Link>
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm transition-colors"
            >
              <Globe className="w-4 h-4" />
              {lang === 'en' ? 'বাংলা' : 'English'}
            </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {lang === 'en' ? 'Shop Directory' : 'শপ ডিরেক্টরি'}
          </h1>
          <p className="text-slate-300 mt-2 text-lg">
            {lang === 'en'
              ? `Discover ${activeShops.length} unique shops — each with their own style`
              : `${activeShops.length}টি অনন্য শপ আবিষ্কার করুন — প্রতিটির নিজস্ব স্টাইল`}
          </p>
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder={lang === 'en' ? 'Search shops...' : 'শপ খুঁজুন...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Shops grid */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeShops.map(shop => {
            const cats = shop.allowedCategories.map(id => ALL_CATEGORIES.find(c => c.id === id)).filter(Boolean)
            const radiusMap = { sharp: '8px', medium: '16px', rounded: '24px' }
            const radius = radiusMap[shop.theme.borderRadius]
            const productCount = products.filter(
              p => p.shopId === shop.id && p.status === 'active' && shop.allowedCategories.includes(p.categoryId)
            ).length
            return (
              <Link
                key={shop.id}
                to="/shop/$slug"
                params={{ slug: shop.slug }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Shop banner */}
                <div className="h-28 relative flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${shop.theme.primaryColor}, ${shop.theme.accentColor})` }}>
                  {shop.logo ? (
                    <img src={shop.logo} alt={shop.name} className="w-14 h-14 rounded-xl object-cover shadow-lg" />
                  ) : (
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-white font-bold text-2xl">{shop.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                      {lang === 'en' ? 'Live' : 'সক্রিয়'} ●
                    </span>
                  </div>
                </div>

                {/* Shop info */}
                <div className="p-5" style={{ fontFamily: shop.theme.fontFamily }}>
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="font-bold text-lg text-slate-900 group-hover:text-(--shop-primary) transition-colors leading-tight"
                      style={{ '--shop-primary': shop.theme.primaryColor } as React.CSSProperties}
                    >
                      {shop.name}
                    </h3>
                    <ArrowRight
                      className="w-4 h-4 text-slate-300 group-hover:text-(--shop-primary) group-hover:translate-x-1 transition-all shrink-0 mt-1"
                      style={{ '--shop-primary': shop.theme.primaryColor } as React.CSSProperties}
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{shop.description}</p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {cats.slice(0, 3).map(cat => cat && (
                      <span key={cat.id} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: shop.theme.primaryColor + 'dd', borderRadius: radius }}>
                        {cat.icon} {lang === 'en' ? cat.name : cat.nameBn}
                      </span>
                    ))}
                    {cats.length > 3 && <span className="text-[11px] text-slate-400">+{cats.length - 3}</span>}
                  </div>

                  {/* Stats — real product count from store */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-slate-500">
                    <span>{productCount} {lang === 'en' ? 'products' : 'পণ্য'}</span>
                    <span>{shop.stats.customers.toLocaleString()} {lang === 'en' ? 'customers' : 'গ্রাহক'}</span>
                    <span className="ml-auto font-medium" style={{ color: shop.theme.primaryColor }}>
                      {lang === 'en' ? 'Visit →' : 'দেখুন →'}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {activeShops.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Store className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{lang === 'en' ? 'No shops found.' : 'কোনো শপ পাওয়া যায়নি।'}</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            ← {lang === 'en' ? 'Back to AITeShops' : 'AITeShops-এ ফিরুন'}
          </Link>
        </div>
      </div>
    </div>
  )
}
