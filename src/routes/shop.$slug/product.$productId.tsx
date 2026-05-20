import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { ShoppingCart, ArrowLeft, Package, CheckCircle, Store, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useState, useCallback, useRef } from 'react'
import { useAdminStore, ALL_CATEGORIES, SUBCATEGORIES_BY_CATEGORY, fmt, effectivePrice, discountBadgeText, hasProductDiscount } from '@/lib/admin-store'
import { useShopCart } from '@/lib/shop-cart'
import { useI18n } from '@/lib/i18n'
import { ProductVideoSection } from '@/components/shop/ProductVideoSection'

const productSearchSchema = z.object({ from: z.enum(['sale']).optional() })

export const Route = createFileRoute('/shop/$slug/product/$productId')({
  validateSearch: productSearchSchema,
  component: ProductDetailPage,
})

/* ─── Image viewer: lens on desktop hover, tap-to-zoom on mobile ── */
function ProductImageViewer({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const [lensPos, setLensPos] = useState({ x: 0.5, y: 0.5 })
  const [hovering, setHovering] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const ZOOM = 2.5
  const LENS = 180

  const getPos = (cx: number, cy: number) => {
    const r = containerRef.current?.getBoundingClientRect()
    if (!r) return { x: 0.5, y: 0.5 }
    return {
      x: Math.max(0.01, Math.min(0.99, (cx - r.left) / r.width)),
      y: Math.max(0.01, Math.min(0.99, (cy - r.top) / r.height)),
    }
  }

  const doZoom = (cx: number, cy: number) => {
    const p = getPos(cx, cy)
    setOrigin(`${p.x * 100}% ${p.y * 100}%`)
    setZoomed(true)
    setHovering(false)
  }

  const doUnzoom = () => { setZoomed(false); setOrigin('50% 50%') }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 select-none"
        style={{ cursor: zoomed ? 'zoom-out' : 'zoom-in', touchAction: 'pan-y' }}
        onMouseEnter={() => !zoomed && setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={e => { if (!zoomed) setLensPos(getPos(e.clientX, e.clientY)) }}
        onClick={e => { zoomed ? doUnzoom() : doZoom(e.clientX, e.clientY) }}
        onTouchStart={e => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
        onTouchEnd={e => {
          if (!touchStartRef.current) return
          const dx = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x)
          const dy = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y)
          touchStartRef.current = null
          if (dx > 10 || dy > 10) return      // swipe → pass through to image nav
          e.preventDefault()                   // tap → prevent ghost click
          zoomed ? doUnzoom() : doZoom(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
        }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          onContextMenu={e => e.preventDefault()}
          className="w-full h-full object-contain p-3 select-none"
          style={{
            transform: zoomed ? `scale(${ZOOM})` : 'scale(1)',
            transformOrigin: origin,
            transition: 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
            WebkitTouchCallout: 'none',
          } as React.CSSProperties}
        />

        {/* Desktop hover lens */}
        {hovering && !zoomed && (
          <div
            className="absolute pointer-events-none rounded-full overflow-hidden border-2 border-white z-30"
            style={{
              width: LENS, height: LENS,
              left: `${lensPos.x * 100}%`, top: `${lensPos.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              backgroundImage: `url(${src})`,
              backgroundSize: `${ZOOM * 100}%`,
              backgroundPosition: `${lensPos.x * 100}% ${lensPos.y * 100}%`,
              backgroundRepeat: 'no-repeat',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.6), 0 8px 32px rgba(0,0,0,0.3)',
            }}
          />
        )}

        {/* Zoom hint label (bottom-right) — fades out when zoomed */}
        <div
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-black/40 text-white text-[11px] px-2.5 py-1.5 rounded-full font-medium pointer-events-none transition-opacity duration-200"
          style={{ opacity: zoomed ? 0 : 1 }}
        >
          <Search className="w-3 h-3" />
          <span>Zoom</span>
        </div>
      </div>

      {/* Explicit zoom toggle button (top-right, always tappable) */}
      <button
        className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition-all active:scale-90"
        style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
        onClick={e => { e.stopPropagation(); zoomed ? doUnzoom() : (setOrigin('50% 50%'), setZoomed(true)) }}
        title={zoomed ? 'Zoom out' : 'Zoom in'}
      >
        <Search className="w-4 h-4" />
      </button>
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────── */
function ProductDetailPage() {
  const { slug, productId } = Route.useParams()
  const { from } = Route.useSearch()
  const { shops, products } = useAdminStore()
  const { addItem, forceAddFromShop } = useShopCart()
  const { lang } = useI18n()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [conflictOpen, setConflictOpen] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const swipeStartX = useRef(0)

  const shop = shops.find(s => s.slug === slug)!
  const product = products.find(p => p.id === productId)
  const radiusMap = { sharp: '8px', medium: '16px', rounded: '24px' }
  const radius = radiusMap[shop.theme.borderRadius]

  const allImgs = product?.images?.length ? product.images.slice(0, 4) : product?.image ? [product.image] : []

  const prevImg = useCallback(() => setImgIdx(i => (i - 1 + allImgs.length) % allImgs.length), [allImgs.length])
  const nextImg = useCallback(() => setImgIdx(i => (i + 1) % allImgs.length), [allImgs.length])

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-gray-400">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>{lang === 'en' ? 'Product not found.' : 'পণ্য পাওয়া যায়নি।'}</p>
        <Link to="/shop/$slug/products" params={{ slug }} className="mt-4 inline-block text-sm font-medium hover:underline" style={{ color: shop.theme.primaryColor }}>
          ← {lang === 'en' ? 'Back to Products' : 'পণ্যে ফিরুন'}
        </Link>
      </div>
    )
  }

  const cat = ALL_CATEGORIES.find(c => c.id === product.categoryId)
  const subcats = product.subcategoryId && product.categoryId ? SUBCATEGORIES_BY_CATEGORY[product.categoryId] : []
  const subcat = subcats?.find(s => s.id === product.subcategoryId)
  const isOut = product.stock === 0
  const isLow = product.stock > 0 && product.stock <= product.lowStockThreshold
  const salePrice = effectivePrice(product)
  const discLabel = discountBadgeText(product, lang)

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) {
      const result = addItem({ productId: product!.id, shopId: shop.id, name: product!.name, price: salePrice, image: allImgs[0] ?? '' })
      if (result === 'shop_conflict') { setConflictOpen(true); return }
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <>
      <style>{`
        @keyframes cartPop { 0%{transform:scale(1)} 40%{transform:scale(1.08)} 70%{transform:scale(0.97)} 100%{transform:scale(1)} }
        .cart-pop { animation: cartPop 0.4s ease; }
      `}</style>

      {/* pb-28 on mobile so content clears the sticky bottom bar */}
      <div className="container mx-auto px-4 py-8 max-w-5xl pb-28 md:pb-8">
        {from === 'sale' && (
          <div className="mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: shop.theme.primaryColor + '18', color: shop.theme.primaryColor }}>
            <Store className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{lang === 'en' ? 'In-store / QR sale — browse and add to cart when you are ready.' : 'দোকান / কিউআর বিক্রয় — প্রস্তুত হলে কার্টে যোগ করুন।'}</p>
          </div>
        )}

        <Link to="/shop/$slug/products" params={{ slug }} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {lang === 'en' ? 'Back to Products' : 'পণ্যে ফিরুন'}
        </Link>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">

          {/* ─── Image gallery ─── */}
          <div className="flex flex-col gap-3">
            {/* Swipe wrapper (handles left/right swipe to change image) */}
            <div
              className="relative"
              onTouchStart={e => { swipeStartX.current = e.touches[0].clientX }}
              onTouchEnd={e => {
                const dx = e.changedTouches[0].clientX - swipeStartX.current
                if (Math.abs(dx) > 40 && allImgs.length > 1) { dx < 0 ? nextImg() : prevImg() }
              }}
            >
              <ProductImageViewer src={allImgs[imgIdx] ?? ''} alt={product.name} />

              {/* Discount badge overlay */}
              {discLabel && !isOut && (
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <span className="text-xs font-bold bg-red-600 text-white px-2.5 py-1 rounded-full shadow">{discLabel}</span>
                </div>
              )}

              {/* Prev / Next arrows */}
              {allImgs.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-all active:scale-90" style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}>
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-all active:scale-90" style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}>
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImgs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border-2 transition-all hover:opacity-100"
                    style={imgIdx === i ? { borderColor: shop.theme.primaryColor, opacity: 1 } : { borderColor: '#e5e7eb', opacity: 0.65 }}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-contain p-1" draggable={false} />
                  </button>
                ))}
              </div>
            )}

            {/* Dot indicators */}
            {allImgs.length > 1 && (
              <div className="flex justify-center gap-1.5">
                {allImgs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className="rounded-full transition-all"
                    style={{ width: imgIdx === i ? '20px' : '6px', height: '6px', backgroundColor: imgIdx === i ? shop.theme.primaryColor : '#d1d5db' }}
                  />
                ))}
              </div>
            )}

            {/* Contextual hint */}
            <p className="hidden md:flex text-center text-xs text-gray-400 items-center justify-center gap-1.5">
              <Search className="w-3 h-3" />
              {lang === 'en' ? 'Hover to zoom · Click image to zoom in/out' : 'হোভার করে জুম করুন · ক্লিক করে জুম করুন'}
            </p>
            <p className="md:hidden text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
              <Search className="w-3 h-3" />
              {lang === 'en' ? 'Tap image to zoom · Swipe to change photo' : 'ট্যাপ করে জুম করুন · সোয়াইপ করে ছবি বদলান'}
            </p>
          </div>

          {/* ─── Product info ─── */}
          <div className="flex flex-col gap-4">
            {/* Category / subcategory chips */}
            <div className="flex flex-wrap gap-2">
              {cat && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: shop.theme.primaryColor + '20', color: shop.theme.primaryColor }}>
                  {cat.icon} {lang === 'en' ? cat.name : cat.nameBn}
                </span>
              )}
              {subcat && (
                <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {lang === 'en' ? subcat.name : subcat.nameBn}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>
            {product.sku && <p className="text-xs text-gray-400 font-mono -mt-2">SKU: {product.sku}</p>}

            {/* Price row */}
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="text-3xl font-bold" style={{ color: shop.theme.primaryColor }}>{fmt(salePrice)}</p>
              {hasProductDiscount(product) && salePrice < product.price && (
                <p className="text-lg text-gray-400 line-through">{fmt(product.price)}</p>
              )}
              {discLabel && !isOut && (
                <span className="text-sm font-bold bg-red-600 text-white px-2.5 py-1 rounded-full">{discLabel}</span>
              )}
            </div>

            {/* Stock badge */}
            <div>
              {isOut ? (
                <span className="text-xs text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">{lang === 'en' ? 'Out of Stock' : 'স্টক নেই'}</span>
              ) : isLow ? (
                <span className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full">{lang === 'en' ? `Only ${product.stock} left` : `মাত্র ${product.stock}টি বাকি`}</span>
              ) : (
                <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'In Stock' : 'স্টকে আছে'}
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">#{tag}</span>
                ))}
              </div>
            )}

            {/* Qty selector */}
            {!isOut && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{lang === 'en' ? 'Qty:' : 'পরিমাণ:'}</span>
                <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderRadius: radius, borderColor: '#e5e7eb' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 text-gray-600 hover:bg-gray-50 text-lg font-medium transition-colors">−</button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-9 h-9 text-gray-600 hover:bg-gray-50 text-lg font-medium transition-colors">+</button>
                </div>
              </div>
            )}

            {/* Desktop CTA — hidden on mobile (sticky bar handles it) */}
            <div className="hidden md:flex gap-3 flex-wrap">
              <button
                disabled={isOut}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${added ? 'cart-pop' : ''}`}
                style={{ backgroundColor: added ? '#22c55e' : shop.theme.primaryColor, borderRadius: radius }}
              >
                {added
                  ? <><CheckCircle className="w-5 h-5" />{lang === 'en' ? 'Added to Cart!' : 'কার্টে যোগ হয়েছে!'}</>
                  : <><ShoppingCart className="w-5 h-5" />{lang === 'en' ? 'Add to Cart' : 'কার্টে যোগ করুন'}</>}
              </button>
              <Link
                to="/shop/$slug/checkout"
                params={{ slug }}
                className="py-3.5 px-5 border-2 font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors hover:bg-gray-50"
                style={{ color: shop.theme.primaryColor, borderColor: shop.theme.primaryColor, borderRadius: radius }}
              >
                {lang === 'en' ? 'View Cart' : 'কার্ট দেখুন'}
              </Link>
            </div>

            <div className="hidden md:block pt-3 border-t">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                {lang === 'en' ? 'Cash on Delivery available across Bangladesh' : 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি পাওয়া যাচ্ছে'}
              </p>
            </div>
          </div>
        </div>

        <ProductVideoSection product={product} lang={lang} />
      </div>

      {/* ─── Mobile sticky bottom bar ─── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-gray-100 px-4 pt-3 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex gap-3 items-center max-w-lg mx-auto">
          <Link
            to="/shop/$slug/checkout"
            params={{ slug }}
            className="shrink-0 py-3 px-4 border-2 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors hover:bg-gray-50"
            style={{ color: shop.theme.primaryColor, borderColor: shop.theme.primaryColor, borderRadius: radius }}
          >
            {lang === 'en' ? 'Cart' : 'কার্ট'}
          </Link>
          <button
            disabled={isOut}
            onClick={handleAddToCart}
            className={`flex-1 py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${added ? 'cart-pop' : ''}`}
            style={{ backgroundColor: added ? '#22c55e' : shop.theme.primaryColor, borderRadius: radius }}
          >
            {added
              ? <><CheckCircle className="w-5 h-5" />{lang === 'en' ? 'Added!' : 'যোগ হয়েছে!'}</>
              : <><ShoppingCart className="w-5 h-5" />{lang === 'en' ? 'Add to Cart' : 'কার্টে যোগ করুন'}</>}
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1">
          <Package className="w-3 h-3" />
          {lang === 'en' ? 'Cash on Delivery · Nationwide' : 'ক্যাশ অন ডেলিভারি · সারা বাংলাদেশ'}
        </p>
      </div>

      {/* ─── Cart conflict dialog ─── */}
      {conflictOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2">{lang === 'en' ? 'Different Shop' : 'ভিন্ন শপ'}</h3>
            <p className="text-sm text-gray-600 mb-5">
              {lang === 'en' ? 'Your cart has items from another shop. Clear cart to continue?' : 'আপনার কার্টে অন্য শপের পণ্য আছে। কার্ট ক্লিয়ার করে চালিয়ে যাবেন?'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConflictOpen(false)} className="flex-1 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50" style={{ borderRadius: radius }}>
                {lang === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                onClick={() => { forceAddFromShop({ productId: product.id, shopId: shop.id, name: product.name, price: salePrice, image: allImgs[0] ?? '' }); setConflictOpen(false); setAdded(true); setTimeout(() => setAdded(false), 1500) }}
                className="flex-1 py-2.5 text-white text-sm font-medium rounded-xl transition-opacity hover:opacity-90"
                style={{ backgroundColor: shop.theme.primaryColor, borderRadius: radius }}
              >
                {lang === 'en' ? 'Clear & Add' : 'ক্লিয়ার করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
