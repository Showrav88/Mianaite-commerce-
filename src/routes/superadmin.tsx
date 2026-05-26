import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Store, Users, Tag, Palette, LogOut, Menu, X,
  ShieldCheck, Globe, ChevronRight, ScanLine,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/superadmin')({
  component: SuperAdminLayout,
})

const NAV = [
  { to: '/superadmin', label: 'admin.dashboard', icon: LayoutDashboard, exact: true },
  { to: '/superadmin/shops', label: 'admin.shops', icon: Store },
  { to: '/superadmin/admins', label: 'admin.admins', icon: Users },
  { to: '/superadmin/categories', label: 'admin.categories', icon: Tag },
  { to: '/superadmin/customization', label: 'admin.customization', icon: Palette },
  { to: '/superadmin/customers', label: 'admin.customers', icon: Users },
] as const

const NAV_COUNTER = { to: '/counter', label: 'Counter POS', icon: ScanLine }

function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t, lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: s => s.location.pathname })

  useEffect(() => {
    if (!user) {
      void navigate({ to: '/login', search: { redirect: '/superadmin' }, replace: true })
    } else if (user.role !== 'super_admin') {
      void navigate({ to: '/admin', replace: true })
    }
  }, [user, navigate])

  if (!user) return null

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">1to99 Market</p>
              <p className="text-[10px] text-violet-300 font-medium uppercase tracking-wider">
                Platform Admin
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700/50" />

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = 'exact' in item && item.exact
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(item.to + '/')
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {t(item.label)}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <Separator className="bg-slate-700/50" />

        {/* Counter POS shortcut */}
        <div className="px-3 py-2">
          <Link
            to={NAV_COUNTER.to as any}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-400 hover:text-white hover:bg-emerald-700/40 transition-all"
          >
            <NAV_COUNTER.icon className="w-4 h-4 shrink-0" />
            {NAV_COUNTER.label}
          </Link>
        </div>

        <Separator className="bg-slate-700/50" />

        {/* Language toggle */}
        <div className="px-4 py-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all text-sm"
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'en' ? 'বাংলায় দেখুন' : 'English'}</span>
          </button>
        </div>

        {/* User */}
        <div className="p-3 border-t border-slate-700/50">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-violet-600 text-white text-xs font-bold">SA</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user!.name}</p>
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
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative z-50 flex flex-col w-60 h-full bg-slate-900">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden h-14 bg-slate-900 border-b border-slate-700 flex items-center gap-3 px-4 shrink-0">
          <button onClick={() => setOpen(true)} className="text-slate-300 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-white text-sm">AITeShops {t('admin.super.title')}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
