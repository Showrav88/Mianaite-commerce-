import { redirect } from '@tanstack/react-router'

/** Block public storefront and marketplace routes — office POS only. */
export function redirectToLogin() {
  throw redirect({ to: '/login', replace: true })
}
