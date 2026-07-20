import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Store, Layers, Users, Palette, LogOut, Menu, Globe, ChevronRight, Shield,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { canAccessSuperAdmin } from '@/lib/permissions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/superadmin')({
  component: SuperAdminLayout,
})

const NAV = [
  { to: '/superadmin', icon: LayoutDashboard, labelEn: 'Dashboard', labelBn: 'ড্যাশবোর্ড', exact: true },
  { to: '/superadmin/shops', icon: Store, labelEn: 'Shops', labelBn: 'শপ' },
  { to: '/superadmin/categories', icon: Layers, labelEn: 'Categories', labelBn: 'ক্যাটাগরি' },
  { to: '/superadmin/admins', icon: Users, labelEn: 'Admins', labelBn: 'অ্যাডমিন' },
  { to: '/superadmin/customers', icon: Users, labelEn: 'Customers', labelBn: 'গ্রাহক' },
  { to: '/superadmin/customization', icon: Palette, labelEn: 'Customization', labelBn: 'কাস্টমাইজ' },
] as const

function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: s => s.location.pathname })

  useEffect(() => {
    if (!user) {
      void navigate({ to: '/login', search: { redirect: pathname }, replace: true })
      return
    }
    if (!canAccessSuperAdmin(user.role)) {
      void navigate({ to: '/login', replace: true })
    }
  }, [user, navigate, pathname])

  if (!user || !canAccessSuperAdmin(user.role)) return null

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center text-white shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">1to99 Platform</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
        </div>

        <Separator />

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = item.exact
              ? pathname === item.to || pathname === item.to + '/'
              : pathname === item.to || pathname.startsWith(item.to + '/')
            return (
              <Link
                key={item.to}
                to={item.to as '/superadmin'}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? 'text-white bg-violet-600 shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {lang === 'en' ? item.labelEn : item.labelBn}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 pb-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-sm"
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'en' ? 'বাংলায় দেখুন' : 'View in English'}</span>
          </button>
        </div>

        <div className="p-3 border-t">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-white text-xs font-bold bg-violet-600">
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
              title="Log out"
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
          <span className="font-semibold text-slate-800 text-sm">Super Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
