import { createFileRoute } from '@tanstack/react-router'
import { redirectToLogin } from '@/lib/office-only'

export const Route = createFileRoute('/shop/$slug')({
  beforeLoad: () => redirectToLogin(),
  component: () => null,
})
