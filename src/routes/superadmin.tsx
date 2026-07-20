import { createFileRoute } from '@tanstack/react-router'
import { redirectToLogin } from '@/lib/office-only'

export const Route = createFileRoute('/superadmin')({
  beforeLoad: () => redirectToLogin(),
  component: () => null,
})
