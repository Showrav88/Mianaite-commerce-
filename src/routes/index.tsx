import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/login', replace: true })
  },
  head: () => ({ meta: [{ title: '1to99 — Login' }] }),
})
