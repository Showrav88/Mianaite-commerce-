import { createFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCart, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { useAdminStore, ALL_CATEGORIES, fmt, effectivePrice, discountBadgeText, hasProductDiscount } from '@/lib/admin-store'
import { useShopCart } from '@/lib/shop-cart'
import { useI18n } from '@/lib/i18n'

export const Route = createFileRoute('/shop/$slug/products')({
  component: ShopProductsPage,
})

function ShopProductsPage() {
  const { slug } = Route.useParams()
  const { shops, products } = useAdminStore()
  const { addItem, forceAddFromShop } = useShopCart()
  const { lang } = useI18n()
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default')
  const [conflictProduct, setConflictProduct] = useState<any>(null)
  const [addedId, setAddedId] = useState<string | null>(null)

  const shop = shops.find(s => s.slug === slug)!
  const cats = shop.allowedCategories.map(id => ALL_CATEGORIES.find(c => c.id === id)).filter(Boolean)
  const radiusMap = { sharp: '8px', medium: '16px', rounded: '24px' }
  const radius = radiusMap[shop.theme.borderRadius]

  // Get search from parent layout via URL (the parent sets searchQuery in context but we can't easily get it, use state instead)
  const [localSearch, setLocalSearch] = useState('')

  let shopProducts = products
    .filter(p => p.shopId === shop.id && p.status === 'active' && shop.allowedCategories.includes(p.categoryId))
    .filter(p => !selectedCat || p.categoryId === selectedCat)
    .filter(p => !localSearch || p.name.toLowerCase().includes(localSearch.toLowerCase()) || p.description.toLowerCase().includes(localSearch.toLowerCase()))

  if (sortBy === 'price_asc') shopProducts = [...shopProducts].sort((a, b) => effectivePrice(a) - effectivePrice(b))
  if (sortBy === 'price_desc') shopProducts = [...shopProducts].sort((a, b) => effectivePrice(b) - effectivePrice(a))

  function handleAddToCart(product: typeof shopProducts[0]) {
    const result = addItem({ productId: product.id, shopId: shop.id, name: product.name, price: effectivePrice(product), image: product.image })
    if (result === 'shop_conflict') { setConflictProduct(product); return }
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1200)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCat(null)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
            style={!selectedCat ? { backgroundColor: shop.theme.primaryColor, color: 'white', borderColor: shop.theme.primaryColor } : { borderColor: '#e5e7eb', color: '#6b7280' }}
          >
            {lang === 'en' ? 'All' : 'সব'}
          </button>
          {cats.map(cat => cat && (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
              style={selectedCat === cat.id ? { backgroundColor: shop.theme.primaryColor, color: 'white', borderColor: shop.theme.primaryColor } : { borderColor: '#e5e7eb', color: '#6b7280' }}
            >
              {cat.icon} {lang === 'en' ? cat.name : cat.nameBn}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="text-xs border rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none"
          >
            <option value="default">{lang === 'en' ? 'Default' : 'ডিফল্ট'}</option>
            <option value="price_asc">{lang === 'en' ? 'Price: Low to High' : 'দাম: কম থেকে বেশি'}</option>
            <option value="price_desc">{lang === 'en' ? 'Price: High to Low' : 'দাম: বেশি থেকে কম'}</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        {shopProducts.length} {lang === 'en' ? 'products found' : 'পণ্য পাওয়া গেছে'}
      </p>

      {/* Products grid */}
      {shopProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {shopProducts.map(product => {
            const isAdded = addedId === product.id
            const isLow = product.stock > 0 && product.stock <= product.lowStockThreshold
            const isOut = product.stock === 0
            const salePrice = effectivePrice(product)
            const discLabel = discountBadgeText(product, lang)
            return (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <Link to="/shop/$slug/product/$productId" params={{ slug, productId: product.id }} className="block">
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                    {isOut && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[10px] font-medium bg-black/50 px-2 py-0.5 rounded-full">
                          {lang === 'en' ? 'Out of Stock' : 'স্টক নেই'}
                        </span>
                      </div>
                    )}
                    {discLabel && !isOut && (
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                          {discLabel}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{product.name}</h3>
                    {isLow && !isOut && <p className="text-[10px] text-amber-600 mt-0.5">{lang === 'en' ? `Only ${product.stock} left` : `মাত্র ${product.stock}টি বাকি`}</p>}
                    <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
                      <span className="font-bold text-base" style={{ color: shop.theme.primaryColor }}>{fmt(salePrice)}</span>
                      {hasProductDiscount(product) && salePrice < product.price && (
                        <span className="text-xs text-gray-400 line-through">{fmt(product.price)}</span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="px-3 pb-3">
                  <button
                    disabled={isOut}
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-2 text-xs font-semibold text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: isAdded ? '#22c55e' : shop.theme.primaryColor, borderRadius: radius }}
                  >
                    {isAdded ? <>{lang === 'en' ? '✓ Added' : '✓ যোগ হয়েছে'}</> : <><ShoppingCart className="w-3.5 h-3.5" />{lang === 'en' ? 'Add to Cart' : 'কার্ট'}</>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>{lang === 'en' ? 'No products found.' : 'কোনো পণ্য পাওয়া যায়নি।'}</p>
          {selectedCat && (
            <button onClick={() => setSelectedCat(null)} className="mt-3 text-sm font-medium hover:underline" style={{ color: shop.theme.primaryColor }}>
              {lang === 'en' ? 'Clear filter' : 'ফিল্টার সরান'}
            </button>
          )}
        </div>
      )}

      {/* Conflict dialog */}
      {conflictProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2">{lang === 'en' ? 'Different Shop' : 'ভিন্ন শপ'}</h3>
            <p className="text-sm text-gray-600 mb-5">
              {lang === 'en' ? 'Your cart has items from another shop. Clear cart to add from this shop?' : 'আপনার কার্টে অন্য শপের পণ্য আছে। এই শপ থেকে যোগ করতে কার্ট ক্লিয়ার করুন?'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConflictProduct(null)} className="flex-1 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50" style={{ borderRadius: radius }}>
                {lang === 'en' ? 'Keep Cart' : 'কার্ট রাখুন'}
              </button>
              <button
                onClick={() => { forceAddFromShop({ productId: conflictProduct.id, shopId: shop.id, name: conflictProduct.name, price: effectivePrice(conflictProduct), image: conflictProduct.image }); setConflictProduct(null) }}
                className="flex-1 py-2.5 text-white text-sm font-medium rounded-xl transition-opacity hover:opacity-90"
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
