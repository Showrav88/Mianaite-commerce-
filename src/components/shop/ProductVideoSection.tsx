import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { AdminProduct } from '@/lib/admin-store'
import {
  productYoutubeId,
  productFacebookEmbedSrc,
  productFacebookPageUrl,
} from '@/lib/social-embed'

type Props = {
  product: AdminProduct
  lang: 'en' | 'bn'
}

export function ProductVideoSection({ product, lang }: Props) {
  const ytId = productYoutubeId(product)
  const fbEmbed = productFacebookEmbedSrc(product)
  const fbPage = productFacebookPageUrl(product)

  if (!ytId && !fbEmbed) return null

  const [active, setActive] = useState<'youtube' | 'facebook'>(ytId ? 'youtube' : 'facebook')

  return (
    <section className="mt-10 max-w-4xl">
      <h2 className="text-lg font-bold text-gray-900 mb-1">
        {lang === 'en' ? 'Product video' : 'পণ্যের ভিডিও'}
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        {lang === 'en'
          ? 'Watch before you buy — shared by the shop on YouTube or Facebook.'
          : 'কেনার আগে দেখুন — শপের YouTube বা Facebook ভিডিও।'}
      </p>

      {ytId && fbEmbed && (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActive('youtube')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              active === 'youtube' ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={active === 'youtube' ? { backgroundColor: '#dc2626' } : undefined}
          >
            YouTube
          </button>
          <button
            type="button"
            onClick={() => setActive('facebook')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              active === 'facebook' ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={active === 'facebook' ? { backgroundColor: '#1877F2' } : undefined}
          >
            Facebook
          </button>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border bg-gray-50 shadow-sm">
        {active === 'youtube' && ytId && (
          <div className="aspect-video w-full bg-black">
            <iframe
              title={lang === 'en' ? 'YouTube product video' : 'YouTube ভিডিও'}
              src={`https://www.youtube.com/embed/${ytId}?rel=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
        {active === 'facebook' && fbEmbed && (
          <div className="aspect-video w-full bg-[#f0f2f5] flex items-center justify-center min-h-[280px]">
            <iframe
              title={lang === 'en' ? 'Facebook product video' : 'Facebook ভিডিও'}
              src={fbEmbed}
              className="w-full max-w-[560px] h-full min-h-[280px] border-0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        {ytId && (
          <a
            href={`https://www.youtube.com/watch?v=${ytId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-red-600 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Open on YouTube' : 'YouTube-এ দেখুন'}
          </a>
        )}
        {fbPage && (
          <a
            href={fbPage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium hover:underline"
            style={{ color: '#1877F2' }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Open on Facebook' : 'Facebook-এ দেখুন'}
          </a>
        )}
      </div>
    </section>
  )
}
