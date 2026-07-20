import type { AuthUser } from './auth'

export type ShopRole = AuthUser['role']

export function homeRouteForRole(role: ShopRole): '/admin' | '/counter' {
  return role === 'staff' ? '/counter' : '/admin'
}

export function canAccessAdminPath(role: ShopRole, path: string): boolean {
  if (role === 'owner') return true
  if (role === 'manager') {
    const blocked = ['/admin/staff', '/admin/wallet', '/admin/settings']
    if (blocked.some(p => path === p || path.startsWith(p + '/'))) return false
    if (path.startsWith('/admin/catalog/products') && path !== '/admin/catalog/products') return false
    return (
      path === '/admin' ||
      path.startsWith('/admin/inventory') ||
      path.startsWith('/admin/labels') ||
      path.startsWith('/admin/sell') ||
      path.startsWith('/admin/reports') ||
      path.startsWith('/admin/catalog/categories')
    )
  }
  if (role === 'staff') {
    return (
      path.startsWith('/admin/inventory') ||
      path.startsWith('/admin/labels')
    )
  }
  return false
}

export function canEditInventory(role: ShopRole): boolean {
  return role === 'owner' || role === 'manager'
}

export function canEditCatalog(role: ShopRole): boolean {
  return role === 'owner'
}

export function canAccessCounter(role: ShopRole): boolean {
  return role === 'owner' || role === 'manager' || role === 'staff'
}

export type NavItem = { to: string; label: string; labelBn: string; icon: string }

export function navSectionsForRole(role: ShopRole): { title: string; titleBn: string; items: { to: string; labelKey: string }[] }[] {
  const catalog = [
    { to: '/admin/catalog/products', labelKey: 'nav.products' },
    { to: '/admin/catalog/categories', labelKey: 'nav.categories' },
  ]
  const ops = [
    { to: '/admin/inventory', labelKey: 'nav.inventory' },
    { to: '/admin/sell', labelKey: 'nav.counterPos' },
    { to: '/admin/labels', labelKey: 'nav.labels' },
  ]
  const finance = [
    { to: '/admin/reports', labelKey: 'nav.reports' },
    { to: '/admin/wallet', labelKey: 'nav.wallet' },
    { to: '/admin/staff', labelKey: 'nav.staff' },
  ]

  if (role === 'owner') {
    return [
      { title: 'Catalog', titleBn: 'ক্যাটালগ', items: catalog },
      { title: 'Operations', titleBn: 'অপারেশন', items: ops },
      { title: 'Finance & HR', titleBn: 'হিসাব ও কর্মী', items: finance },
    ]
  }
  if (role === 'manager') {
    return [
      { title: 'Operations', titleBn: 'অপারেশন', items: [
        { to: '/admin/inventory', labelKey: 'nav.inventory' },
        { to: '/admin/sell', labelKey: 'nav.counterPos' },
        { to: '/admin/labels', labelKey: 'nav.labels' },
        { to: '/admin/reports', labelKey: 'nav.reports' },
      ]},
    ]
  }
  return [
    { title: 'Staff', titleBn: 'কর্মী', items: [
      { to: '/admin/inventory', labelKey: 'nav.inventoryCheck' },
      { to: '/admin/labels', labelKey: 'nav.labels' },
    ]},
  ]
}
