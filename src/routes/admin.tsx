import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useState, type ElementType } from 'react'
import {
  LayoutDashboard, Package, BarChart2, Settings, LogOut, Menu, Globe, ChevronRight,
  ScanLine, Printer, Layers, Wallet, Users, FileBarChart, Truck,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useAdminStore } from '@/lib/admin-store'
import { useI18n, type Key } from '@/lib/i18n'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  canAccessAdminPath,
  canAccessCounter,
  homeRouteForRole,
  navSectionsForRole,
} from '@/lib/permissions'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

const ITEM_ICON: Record<string, ElementType> = {
  '/admin/catalog/products': Package,
  '/admin/catalog/categories': Layers,
  '/admin/inventory': BarChart2,
  '/admin/sell': ScanLine,
  '/admin/labels': Printer,
  '/admin/reports': FileBarChart,
  '/admin/suppliers': Truck,
  '/admin/wallet': Wallet,
  '/admin/staff': Users,
  '/admin/settings': Settings,
}

const SECTION_KEYS: Record<string, Key> = {
  Catalog: 'nav.sectionCatalog',
  Operations: 'nav.sectionOperations',
  'Finance & HR': 'nav.sectionFinance',
  Staff: 'nav.sectionStaffNav',
}

function NavLink({
  item,
  active,
  primaryColor,
  onClose,
  label,
}: {
  item: { to: string; icon: ElementType }
  active: boolean
  primaryColor: string
  onClose: () => void
  label: string
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
      {label}
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
    if (!user) {
      void navigate({ to: '/login', search: { redirect: pathname }, replace: true })
      return
    }
    if (!canAccessAdminPath(user.role, pathname)) {
      void navigate({ to: homeRouteForRole(user.role), replace: true })
    }
  }, [user, navigate, pathname])

  if (!user) return null
  if (!canAccessAdminPath(user.role, pathname)) return null

  const shop = shops.find(s => s.id === user.shopId)
  const primaryColor = shop?.theme.primaryColor ?? '#f97316'
  const sections = navSectionsForRole(user.role)

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: primaryColor }}>
              1
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">{shop?.name ?? '1to99'}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{t('admin.dashboard')}</p>
            </div>
          </div>
        </div>

        <Separator />

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {user.role !== 'staff' && (
              <NavLink
                item={{ to: '/admin', icon: LayoutDashboard }}
                active={pathname === '/admin'}
                primaryColor={primaryColor}
                onClose={() => setOpen(false)}
                label={t('nav.dashboard')}
              />
          )}

          {sections.map(section => (
            <div key={section.title}>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 pt-4 pb-1">
                {t(SECTION_KEYS[section.title] ?? 'nav.sectionOperations')}
              </p>
              {section.items.map(item => {
                const active = pathname === item.to || pathname.startsWith(item.to + '/')
                return (
                  <NavLink
                    key={item.to}
                    item={{ to: item.to, icon: ITEM_ICON[item.to] ?? Package }}
                    active={active}
                    primaryColor={primaryColor}
                    onClose={() => setOpen(false)}
                    label={t(item.labelKey as Key)}
                  />
                )
              })}
            </div>
          ))}

          {canAccessCounter(user.role) && (
            <Link
              to="/counter"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 transition-all mt-2"
            >
              <ScanLine className="w-4 h-4 shrink-0" />
              {t('nav.fullPos')}
            </Link>
          )}

          {user.role === 'owner' && (
            <>
              <Separator className="my-2" />
              <NavLink
                item={{ to: '/admin/settings', icon: Settings }}
                active={pathname.startsWith('/admin/settings')}
                primaryColor={primaryColor}
                onClose={() => setOpen(false)}
                label={t('common.settings')}
              />
            </>
          )}
        </nav>

        <div className="px-4 pb-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-sm"
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'en' ? t('common.viewInBangla') : t('common.viewInEnglish')}</span>
          </button>
        </div>

        <div className="p-3 border-t">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-white text-xs font-bold" style={{ backgroundColor: primaryColor }}>
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
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
      <aside className="hidden md:flex flex-col w-60 bg-white border-r shrink-0">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative z-50 flex flex-col w-60 h-full bg-white border-r">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden h-14 bg-white border-b flex items-center gap-3 px-4 shrink-0">
          <button onClick={() => setOpen(true)} className="text-slate-500 hover:text-slate-700">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-slate-800 text-sm">{shop?.name ?? '1to99'}</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
