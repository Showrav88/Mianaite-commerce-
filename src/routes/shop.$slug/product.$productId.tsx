import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { ShoppingCart, ArrowLeft, Package, CheckCircle, Store, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAdminStore, ALL_CATEGORIES, SUBCATEGORIES_BY_CATEGORY, fmt, effectivePrice, discountBadgeText, hasProductDiscount } from '@/lib/admin-store'
import { useShopCart } from '@/lib/shop-cart'
import { useI18n } from '@/lib/i18n'
import { ProductVideoSection } from '@/components/shop/ProductVideoSection'

const productSearchSchema = z.object({
  from: z.enum(['sale']).optional(),
})

export const Route = createFileRoute('/shop/$slug/product/$productId')({
  validateSearch: productSearchSchema,
  component: ProductDetailPage,
})

/* ─── Zoom Lens Component ───────────────────────────────────── */
function ZoomLens({ src, alt, onOpenLightbox }: { src: string; alt: string; onOpenLightbox: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isZooming, setIsZooming] = useState(false)
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = containerRef.current?.getBoundingClientRect()
    if (!r) return
    setPos({
      x: Math.max(0.01, Math.min(0.99, (e.clientX - r.left) / r.width)),
      y: Math.max(0.01, Math.min(0.99, (e.clientY - r.top) / r.height)),
    })
  }

  const ZOOM = 3.5 // magnification level
  const LENS = 180  // lens size in px

  return (
    <div className="flex flex-col gap-3">
      {/* Main image + lens */}
      <div
        ref={containerRef}
        className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 select-none"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
        onClick={onOpenLightbox}
        style={{ cursor: isZooming ? 'crosshair' : 'zoom-in' }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain p-3"
          draggable={false}
        />

        {/* Zoom lens follows cursor */}
        {isZooming && (
          <div
            className="absolute pointer-events-none rounded-full overflow-hidden border-2 border-white shadow-2xl z-30"
            style={{
              width: LENS,
              height: LENS,
              left: `${pos.x * 100}%`,
              top: `${pos.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              backgroundImage: `url(${src})`,
              backgroundSize: `${ZOOM * 100}%`,
              backgroundPosition: `${pos.x * 100}% ${pos.y * 100}%`,
              backgroundRepeat: 'no-repeat',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.6), 0 8px 32px rgba(0,0,0,0.3)',
            }}
          />
        )}

        {/* Click-to-fullscreen hint */}
        <div
          className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-opacity"
          style={{ opacity: isZooming ? 0 : 1 }}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          {/* hint only on non-zoom state */}
        </div>
      </div>
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
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  const shop = shops.find(s => s.slug === slug)!
  const product = products.find(p => p.id === productId)
  const radiusMap = { sharp: '8px', medium: '16px', rounded: '24px' }
  const radius = radiusMap[shop.theme.borderRadius]

  // Max 4 images per product
  const allImgs = product?.images?.length ? product.images.slice(0, 4) : product?.image ? [product.image] : []

  const openLightbox = (idx: number) => { setLightboxIdx(idx); setLightboxOpen(true) }
  const closeLightbox = useCallback(() => setLightboxOpen(false), [])
  const prevLb = useCallback(() => setLightboxIdx(i => (i - 1 + allImgs.length) % allImgs.length), [allImgs.length])
  const nextLb = useCallback(() => setLightboxIdx(i => (i + 1) % allImgs.length), [allImgs.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevLb()
      if (e.key === 'ArrowRight') nextLb()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, closeLightbox, prevLb, nextLb])

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
        @keyframes fadeInScale { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        .lightbox-enter { animation: fadeInScale 0.18s ease; }
      `}</style>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
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

        <div className="grid md:grid-cols-2 gap-10">

          {/* ─── Image Gallery with Zoom Lens ─── */}
          <div className="flex flex-col gap-3">
            {/* Zoom image */}
            <ZoomLens
              src={allImgs[imgIdx] ?? ''}
              alt={product.name}
              onOpenLightbox={() => openLightbox(imgIdx)}
            />

            {/* Discount badge overlay — separate from zoom container */}
            <div className="relative -mt-3">
              {discLabel && !isOut && (
                <span className="absolute top-0 left-0 text-xs font-bold bg-red-600 text-white px-2.5 py-1 rounded-full shadow animate-pulse -translate-y-full">{discLabel}</span>
              )}
            </div>

            {/* Thumbnail strip (max 4) */}
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

            {/* Zoom instruction */}
            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
              🔍 {lang === 'en' ? 'Hover to zoom · Click for fullscreen' : 'জুম করতে হোভার করুন · ফুলস্ক্রিনের জন্য ক্লিক করুন'}
            </p>
          </div>

          {/* ─── Product Info ─── */}
          <div className="flex flex-col gap-4">
            {/* Badges */}
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
            {product.sku && <p className="text-xs text-gray-400 font-mono">SKU: {product.sku}</p>}

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="text-3xl font-bold" style={{ color: shop.theme.primaryColor }}>{fmt(salePrice)}</p>
              {hasProductDiscount(product) && salePrice < product.price && (
                <p className="text-lg text-gray-400 line-through">{fmt(product.price)}</p>
              )}
              {discLabel && !isOut && (
                <span className="text-sm font-bold bg-red-600 text-white px-2.5 py-1 rounded-full">{discLabel}</span>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">#{tag}</span>
                ))}
              </div>
            )}

            {/* Stock */}
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

            {/* Qty */}
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

            {/* CTA */}
            <div className="flex gap-3 flex-wrap">
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

            {/* COD note */}
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                {lang === 'en' ? 'Cash on Delivery available across Bangladesh' : 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি পাওয়া যাচ্ছে'}
              </p>
            </div>
          </div>
        </div>

        {/* Video */}
        <ProductVideoSection product={product} lang={lang} />
      </div>

      {/* ─── Fullscreen Lightbox ─── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 lightbox-enter"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors z-10">
            <X className="w-6 h-6" />
          </button>

          {allImgs.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prevLb() }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition-colors z-10">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={e => { e.stopPropagation(); nextLb() }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition-colors z-10">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={allImgs[lightboxIdx]}
            alt={product.name}
            className="max-w-full max-h-[88vh] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
            draggable={false}
          />

          {allImgs.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {allImgs.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setLightboxIdx(i) }}
                  className="rounded-full transition-all"
                  style={{ width: lightboxIdx === i ? '24px' : '8px', height: '8px', backgroundColor: lightboxIdx === i ? (shop.theme.accentColor ?? '#fff') : 'rgba(255,255,255,0.35)' }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Cart Conflict Dialog ─── */}
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
