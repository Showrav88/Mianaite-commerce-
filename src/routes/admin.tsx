import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useState, type ElementType } from 'react'
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2, Settings,
  LogOut, Menu, Globe, ChevronRight, ExternalLink, Users, ScanLine,
  RotateCcw, Printer, Layers,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useAdminStore } from '@/lib/admin-store'
import { useI18n } from '@/lib/i18n'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

const NAV_TOP = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
] as const

const NAV_CATALOG = [
  { to: '/admin/catalog/products', label: 'Products', icon: Package },
  { to: '/admin/catalog/categories', label: 'Categories', icon: Layers },
] as const

const NAV_OPS = [
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/inventory', label: 'Inventory', icon: BarChart2 },
  { to: '/admin/returns', label: 'Returns', icon: RotateCcw },
  { to: '/admin/labels', label: 'Labels', icon: Printer },
  { to: '/admin/sell', label: 'Counter POS', icon: ScanLine },
] as const

const NAV_BOTTOM = [
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
] as const

function NavLink({
  item,
  active,
  primaryColor,
  onClose,
}: {
  item: { to: string; label: string; icon: ElementType }
  active: boolean
  primaryColor: string
  onClose: () => void
}) {
  return (
    <Link
      to={item.to as any}
      onClick={onClose}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active ? 'text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
      }`}
      style={active ? { backgroundColor: primaryColor } : {}}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      {item.label}
      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
    </Link>
  )
}

function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t, lang, setLang } = useI18n()
  const { shops } = useAdminStore()
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: s => s.location.pathname })

  useEffect(() => {
    if (!user) void navigate({ to: '/login', search: { redirect: '/admin' }, replace: true })
    else if (user.role === 'super_admin') void navigate({ to: '/superadmin', replace: true })
  }, [user, navigate])

  if (!user) return null

  const shop = shops.find(s => s.id === user!.shopId)
  const primaryColor = shop?.theme.primaryColor ?? '#f97316'

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3">
            {shop?.logo ? (
              <img src={shop.logo} alt={shop.name} className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-100" />
            ) : (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: primaryColor }}>
                {(shop?.name ?? user!.shopName ?? 'A').charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">{shop?.name ?? user!.shopName}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{t('admin.dashboard')}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_TOP.map(item => {
            const active = pathname === item.to
            return (
              <NavLink key={item.to} item={item} active={active} primaryColor={primaryColor} onClose={() => setOpen(false)} />
            )
          })}

          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 pt-4 pb-1">Catalog</p>
          {NAV_CATALOG.map(item => {
            const active = pathname === item.to || pathname.startsWith(item.to + '/')
            return (
              <NavLink key={item.to} item={item} active={active} primaryColor={primaryColor} onClose={() => setOpen(false)} />
            )
          })}

          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 pt-4 pb-1">Operations</p>
          {NAV_OPS.map(item => {
            const active = pathname === item.to || pathname.startsWith(item.to + '/')
            return (
              <NavLink key={item.to} item={item} active={active} primaryColor={primaryColor} onClose={() => setOpen(false)} />
            )
          })}

          {user!.shopId === 'shop_6' && (
            <Link
              to={'/counter' as any}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 transition-all mt-1"
            >
              <ScanLine className="w-4 h-4 shrink-0" />
              Market Counter POS
            </Link>
          )}

          <Separator className="my-2" />
          {NAV_BOTTOM.map(item => {
            const active = pathname === item.to || pathname.startsWith(item.to + '/')
            return (
              <NavLink key={item.to} item={item} active={active} primaryColor={primaryColor} onClose={() => setOpen(false)} />
            )
          })}
        </nav>

        <Separator />

        {/* Visit store link */}
        <div className="px-4 py-3">
          {shop ? (
            <a
              href={`/shop/${shop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              {t('admin.visitStore')}
            </a>
          ) : (
            <span className="flex items-center gap-2 px-3 py-2 text-slate-300 text-sm cursor-not-allowed">
              <ExternalLink className="w-4 h-4" />
              {t('admin.visitStore')}
            </span>
          )}
        </div>

        {/* Language toggle */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-sm"
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'en' ? 'বাংলায় দেখুন' : 'English'}</span>
          </button>
        </div>

        {/* User */}
        <div className="p-3 border-t">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-white text-xs font-bold" style={{ backgroundColor: primaryColor }}>
                {user!.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user!.name}</p>
              <p className="text-xs text-slate-400 truncate">{user!.email}</p>
            </div>
            <button
              onClick={() => { logout(); navigate({ to: '/login' }) }}
              className="text-slate-400 hover:text-red-400 transition-colors p-1"
              title={t('admin.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative z-50 flex flex-col w-60 h-full bg-white border-r">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden h-14 bg-white border-b flex items-center gap-3 px-4 shrink-0">
          <button onClick={() => setOpen(true)} className="text-slate-500 hover:text-slate-700">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: primaryColor }}>
              {(shop?.name ?? 'A').charAt(0)}
            </div>
            <span className="font-semibold text-slate-800 text-sm">{shop?.name ?? user.shopName}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
