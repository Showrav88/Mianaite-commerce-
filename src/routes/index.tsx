import { createFileRoute, redirect } from '@tanstack/react-router'
import { DEFAULT_1TO99_STOREFRONT_SLUG } from '@/mock/shops'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: '/shop/$slug',
      params: { slug: DEFAULT_1TO99_STOREFRONT_SLUG },
      replace: true,
    })
  },
  head: () => ({ meta: [{ title: '1to99 Market — Mirpur' }] }),
})
