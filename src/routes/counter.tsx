import { createFileRoute, useNavigate, useRouterState, Link, Outlet } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Store, BarChart2, ArrowLeft, LogOut, Tag, Package, Globe, Banknote } from 'lucide-react'
import { useMarketStore, expectedDrawerCash } from '@/lib/market-store'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { canAccessAdminPath } from '@/lib/permissions'
import { fmt } from '@/lib/admin-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export const Route = createFileRoute('/counter')({
  component: CounterLayout,
})

function CounterLayout() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: s => s.location.pathname })
  const { getActiveShift, endShiftWithCount } = useMarketStore()
  const { t, lang, setLang, tx } = useI18n()
  const { user, logout } = useAuth()
  const shopId = user?.shopId ?? 'shop_6'
  const activeShift = getActiveShift(shopId)

  const [endOpen, setEndOpen] = useState(false)
  const [closingCash, setClosingCash] = useState('')
  const [handoffNote, setHandoffNote] = useState('')

  useEffect(() => {
    if (!user) {
      void navigate({ to: '/login', search: { redirect: '/counter' }, replace: true })
    }
  }, [user, navigate])

  if (!user) return null

  const expected = activeShift ? expectedDrawerCash(activeShift) : 0
  const canEnd = user.role === 'owner' || user.role === 'manager' || (activeShift?.staffId === user.id)

  function submitEndShift() {
    if (!activeShift) return
    const closing = Number(closingCash)
    if (Number.isNaN(closing) || closing < 0) {
      toast.error(tx('Enter counted cash in drawer.', 'দরাজে গণনা করা নগদ লিখুন।'))
      return
    }
    const variance = closing - expected
    if (variance !== 0 && !handoffNote.trim()) {
      toast.error(tx('Explain cash mismatch in the note.', 'পার্থক্যের কারণ নোটে লিখুন।'))
      return
    }
    const res = endShiftWithCount({ closingCash: closing, handoffNote: handoffNote.trim() || undefined })
    if (!res.ok) {
      toast.error(tx('No active shift.', 'কোনো শিফট নেই।'))
      return
    }
    toast.success(tx('Shift closed. Drawer recorded.', 'শিফট শেষ। দরাজ রেকর্ড হয়েছে।'))
    setEndOpen(false)
    setClosingCash('')
    setHandoffNote('')
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden flex-col">
      <header className="h-11 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-3 shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link to="/login" className="text-slate-400 hover:text-white shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
              <Store className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold hidden sm:inline">{t('counter.brandPos')}</span>
          </div>
          {activeShift && (
            <span className="text-[10px] text-emerald-400 border border-emerald-800 bg-emerald-950 rounded-full px-2 py-0.5 truncate max-w-[140px]">
              {activeShift.staffName}
            </span>
          )}
          {activeShift && (
            <span className="hidden md:flex items-center gap-1 text-[10px] text-slate-400">
              <Banknote className="w-3 h-3" />
              {tx('Drawer', 'দরাজ')}: <strong className="text-emerald-300">{fmt(expected)}</strong>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {canEnd && activeShift && pathname.startsWith('/counter') && !pathname.includes('shifts') && (
            <Button size="sm" variant="outline" className="h-8 text-xs border-slate-600" onClick={() => { setClosingCash(String(expected)); setEndOpen(true) }}>
              {t('counter.endShift')}
            </Button>
          )}
          {user.role !== 'staff' && canAccessAdminPath(user.role, '/admin/inventory') && (
            <Link to="/admin/inventory" className="hidden lg:flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1">
              <Package className="w-3.5 h-3.5" />
            </Link>
          )}
          {user.role !== 'staff' && canAccessAdminPath(user.role, '/admin/labels') && (
            <Link to="/admin/labels" className="hidden lg:flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1">
              <Tag className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link
            to="/counter/shifts"
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
              pathname === '/counter/shifts' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('counter.shiftReport')}</span>
          </Link>
          <button type="button" onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} className="text-slate-400 hover:text-white p-1">
            <Globe className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => { logout(); void navigate({ to: '/login' }) }} className="text-slate-400 hover:text-red-400 p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden min-h-0">
        <Outlet />
      </div>

      <Dialog open={endOpen} onOpenChange={setEndOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{tx('End shift — count drawer cash', 'শিফট শেষ — দরাজের নগদ গুনুন')}</DialogTitle>
          </DialogHeader>
          {activeShift && (
            <div className="space-y-3 text-sm">
              <p>{tx('Expected in drawer', 'আনুমানিক দরাজে')}: <strong>{fmt(expected)}</strong></p>
              <p className="text-muted-foreground text-xs">
                {tx('Opening', 'খোলা')} {fmt(activeShift.openingCash)} + {tx('cash sales', 'নগদ বিক্রয়')} {fmt(activeShift.totals.cash)}
              </p>
              <div>
                <Label>{tx('Counted cash now', 'এখন গণনা করা নগদ')}</Label>
                <Input type="number" min={0} value={closingCash} onChange={e => setClosingCash(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>{tx('Handoff note (required if mismatch)', 'নোট (পার্থক্য হলে প্রয়োজন)')}</Label>
                <Textarea value={handoffNote} onChange={e => setHandoffNote(e.target.value)} rows={2} className="mt-1" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndOpen(false)}>{tx('Cancel', 'বাতিল')}</Button>
            <Button onClick={submitEndShift}>{t('counter.endShift')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
