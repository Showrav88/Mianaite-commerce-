import { createFileRoute, Link } from '@tanstack/react-router'
import { useMarketStore } from '@/lib/market-store'
import { useI18n } from '@/lib/i18n'
import { MARKET_SHOPS } from '@/mock/shops'
import { ShoppingCart, AlertTriangle, Tag, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useShopCart } from '@/lib/shop-cart'
import { toast } from 'sonner'

export const Route = createFileRoute('/shop/$slug/deals')({
  component: DealsPage,
  head: () => ({ meta: [{ title: "Today's Deals — 1to99 Market" }] }),
})

const fmt = (n: number) => `৳${n.toLocaleString('en-BD')}`

function DealsPage() {
  const { slug } = Route.useParams()
  const { deals } = useMarketStore()
  const { addItem } = useShopCart()
  const { t, lang } = useI18n()

  const shop = MARKET_SHOPS.find(s => s.slug === slug)
  const activeDeals = deals.filter(d => d.active && d.shopSlug === slug)

  function handleAddToCart(deal: typeof activeDeals[0]) {
    const result = addItem({
      shopId: deal.shopId,
      productId: deal.productId,
      name: `${deal.productName} (${lang === 'bn' ? 'ডিল' : 'Deal'} — ${deal.discountPercent}% ${lang === 'bn' ? 'ছাড়' : 'off'})`,
      price: deal.dealPrice,
      image: deal.images[0] ?? '',
    })
    if (result === 'added') {
      toast.success(t('deals.addedToCart'))
    } else {
      toast.error(t('deals.cartConflict'))
    }
  }

  const itemCountKey = activeDeals.length === 1 ? 'deals.itemCount' : 'deals.itemCountPlural'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link to="/shop/$slug" params={{ slug }} className="inline-flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-400 hover:underline mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('deals.back')} {shop?.name ?? (lang === 'bn' ? 'শপ' : 'Shop')}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Tag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('deals.title')}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t(itemCountKey, { n: String(activeDeals.length) })} — {t('deals.tagline')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer banner */}
      <div className="bg-amber-500 text-white">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p className="text-sm font-medium">
            {t('deals.soldAsIs')} {t('deals.noReturns')}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {activeDeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Tag className="w-14 h-14 text-muted-foreground/20 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">{t('deals.noDeals')}</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('deals.noDealsDesc')}
            </p>
            <Link to="/shop/$slug" params={{ slug }}>
              <Button variant="outline" size="sm" className="mt-5 gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> {t('deals.browse')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeDeals.map(deal => (
              <div
                key={deal.id}
                className="rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-4/3 bg-muted overflow-hidden">
                  <img
                    src={deal.images[0]}
                    alt={deal.productName}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-500 text-white font-bold text-sm">
                    -{deal.discountPercent}%
                  </Badge>
                  <Badge className="absolute top-3 right-3 bg-slate-800/80 text-white text-[10px] font-medium backdrop-blur-sm">
                    {t('deals.soldAsIsBadge')}
                  </Badge>
                </div>

                <div className="flex flex-col flex-1 p-4 space-y-3">
                  {/* Title + variant */}
                  <div>
                    <h3 className="font-semibold text-foreground leading-tight">{deal.productName}</h3>
                    {deal.variantLabel && (
                      <p className="text-xs text-muted-foreground mt-0.5">{deal.variantLabel}</p>
                    )}
                  </div>

                  {/* Defect callout */}
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      {deal.defectNote}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-foreground">{fmt(deal.dealPrice)}</span>
                    <span className="text-sm text-muted-foreground line-through">{fmt(deal.originalPrice)}</span>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {t('deals.saveAmount', { amount: fmt(deal.originalPrice - deal.dealPrice) })}
                    </span>
                  </div>

                  {/* Add to cart */}
                  <Button
                    className="w-full gap-2 mt-auto"
                    onClick={() => handleAddToCart(deal)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {t('deals.addToCart')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
