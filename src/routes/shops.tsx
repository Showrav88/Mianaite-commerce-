import { createFileRoute } from '@tanstack/react-router'
import { redirectToLogin } from '@/lib/office-only'

export const Route = createFileRoute('/shops')({
  beforeLoad: () => redirectToLogin(),
  component: () => null,
})
