import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { RotateCcw, ChevronRight, CheckSquare, Tag, Trash2, AlertTriangle } from 'lucide-react'
import { useMarketStore } from '@/lib/market-store'
import { useI18n } from '@/lib/i18n'
import type { MarketReturn, ReturnStatus } from '@/mock/returns'
import type { MarketDeal } from '@/mock/deals'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/returns')({
  component: ReturnsPage,
  head: () => ({ meta: [{ title: 'Returns — 1to99 Market Admin' }] }),
})

const STATUS_COLORS: Record<ReturnStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  inspecting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  restocked: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  sent_to_deals: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  written_off: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
}

const WRITE_OFF_REASONS_EN = [
  'Manufacturing defect — vendor complaint filed',
  'Beyond economic repair',
  'Safety hazard — cannot be resold',
  'Counterfeit item identified',
  'Damaged beyond use',
  'Other',
]

const WRITE_OFF_REASONS_BN = [
  'উৎপাদন ত্রুটি — বিক্রেতাকে অভিযোগ জানানো হয়েছে',
  'মেরামত অর্থনৈতিকভাবে সম্ভব নয়',
  'নিরাপত্তা ঝুঁকি — পুনরায় বিক্রয় করা যাবে না',
  'নকল পণ্য সনাক্ত হয়েছে',
  'ব্যবহারের অযোগ্যভাবে ক্ষতিগ্রস্ত',
  'অন্যান্য',
]

const fmt = (n: number) => `৳${n.toLocaleString('en-BD')}`

function ReturnSheet({
  ret,
  onClose,
}: {
  ret: MarketReturn
  onClose: () => void
}) {
  const { updateReturnStatus, addDeal } = useMarketStore()
  const { t, lang } = useI18n()
  const [step, setStep] = useState<'triage' | 'deals' | 'writeoff' | 'done'>('triage')
  const [discountPct, setDiscountPct] = useState(25)
  const [defectNote, setDefectNote] = useState(ret.inspectionNote ?? '')
  const WRITE_OFF_REASONS = lang === 'bn' ? WRITE_OFF_REASONS_BN : WRITE_OFF_REASONS_EN
  const [writeOffReason, setWriteOffReason] = useState(WRITE_OFF_REASONS[0])
  const [showConfirmRestock, setShowConfirmRestock] = useState(false)
  const [showConfirmWriteOff, setShowConfirmWriteOff] = useState(false)

  const dealPrice = Math.round(ret.unitPrice * (1 - discountPct / 100))

  function doRestock() {
    updateReturnStatus(ret.id, 'restocked', { inspectionNote: defectNote || undefined })
    toast.success(lang === 'bn' ? `${ret.productName} পুনঃস্টক হয়েছে` : `${ret.productName} restocked successfully`)
    onClose()
  }

  function doSendToDeals() {
    const deal: MarketDeal = {
      id: `deal_${Date.now()}`,
      shopId: ret.shopId,
      shopSlug: '1to99-market-dhaka-mirpur-tw3k9p',
      productId: ret.productId,
      productName: ret.productName,
      productSlug: ret.productId.replace('prod_', '').replace(/_/g, '-'),
      variantId: ret.variantId,
      variantLabel: ret.variantLabel,
      images: [`https://placehold.co/400x320/e8e8e8/555?text=${encodeURIComponent(ret.productName)}`],
      originalPrice: ret.unitPrice,
      dealPrice,
      discountPercent: discountPct,
      defectNote,
      active: true,
      createdAt: new Date().toISOString().slice(0, 10),
      sourceReturnId: ret.id,
    }
    addDeal(deal)
    updateReturnStatus(ret.id, 'sent_to_deals', { dealId: deal.id, inspectionNote: defectNote })
    toast.success(lang === 'bn' ? `${ret.productName} ডিলস চ্যানেলে লাইভ হয়েছে` : `${ret.productName} is now live in the Deals channel`)
    onClose()
  }

  function doWriteOff() {
    updateReturnStatus(ret.id, 'written_off', { inspectionNote: writeOffReason })
    toast.success(lang === 'bn' ? `${ret.productName} বাতিল হয়েছে` : `${ret.productName} written off`)
    onClose()
  }

  const statusColor = STATUS_COLORS[ret.status]
  const statusLabel = t(`returns.status.${ret.status}` as any)
  const isResolved = ['restocked', 'sent_to_deals', 'written_off'].includes(ret.status)

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pr-6">
          <SheetTitle className="text-left">
            {lang === 'bn' ? 'রিটার্ন —' : 'Return —'} {ret.productName}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pt-4">
          {/* Context */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">{ret.orderNumber}</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>{statusLabel}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{ret.productName}</p>
            <p className="text-xs text-muted-foreground">{ret.variantLabel} · {ret.qty} {t('common.units')} · {fmt(ret.unitPrice)}</p>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('returns.customer')}</p>
              <p className="text-sm">{ret.customerName} · {ret.customerPhone}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('returns.reason')}</p>
              <p className="text-sm text-foreground leading-relaxed">{ret.reason}</p>
            </div>
            {ret.inspectionNote && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t('returns.inspectionNote')}</p>
                <p className="text-sm text-foreground leading-relaxed">{ret.inspectionNote}</p>
              </div>
            )}
          </div>

          {isResolved && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 p-4 text-center">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {t('returns.resolved')}: <span className="capitalize">{statusLabel}</span>
              </p>
            </div>
          )}

          {!isResolved && step === 'triage' && (
            <>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">{t('returns.inspectionNote')}</Label>
                <Textarea
                  value={defectNote}
                  onChange={e => setDefectNote(e.target.value)}
                  rows={3}
                  placeholder={t('returns.conditionDesc')}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">{t('returns.outcome')}</p>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-auto py-3 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                    onClick={() => setShowConfirmRestock(true)}
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{t('returns.restock')}</p>
                      <p className="text-xs text-muted-foreground">{t('returns.restockDesc')}</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-auto py-3 border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                    onClick={() => setStep('deals')}
                  >
                    <Tag className="w-4 h-4 text-purple-600 shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{t('returns.sendToDeals')}</p>
                      <p className="text-xs text-muted-foreground">{t('returns.sendToDealsDesc')}</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-auto py-3 border-red-200 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => setStep('writeoff')}
                  >
                    <Trash2 className="w-4 h-4 text-destructive shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{t('returns.writeOff')}</p>
                      <p className="text-xs text-muted-foreground">{t('returns.writeOffDesc')}</p>
                    </div>
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Send to Deals form */}
          {step === 'deals' && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" className="gap-1.5 -ml-1 h-7 text-xs" onClick={() => setStep('triage')}>
                {t('common.back')}
              </Button>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">{t('returns.defectNote')}</Label>
                <Textarea
                  value={defectNote}
                  onChange={e => setDefectNote(e.target.value)}
                  rows={3}
                  placeholder={t('returns.defectDesc')}
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  {t('returns.discount')} — {discountPct}% {lang === 'bn' ? 'ছাড়' : 'off'}
                  <span className="ml-2 text-muted-foreground text-xs font-normal">
                    {fmt(ret.unitPrice)} → <strong className="text-purple-600">{fmt(dealPrice)}</strong>
                  </span>
                </Label>
                <Slider
                  min={10} max={70} step={5}
                  value={[discountPct]}
                  onValueChange={([v]) => setDiscountPct(v)}
                  className="py-1"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>10%</span><span>70%</span>
                </div>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-800 p-3">
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  {t('returns.dealsInfo')}
                </p>
              </div>
              <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700" onClick={doSendToDeals} disabled={!defectNote.trim()}>
                <Tag className="w-4 h-4" /> {t('returns.publishAt')} {fmt(dealPrice)}
              </Button>
            </div>
          )}

          {/* Write-off form */}
          {step === 'writeoff' && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" className="gap-1.5 -ml-1 h-7 text-xs" onClick={() => setStep('triage')}>
                {t('common.back')}
              </Button>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">{t('returns.writeOffReason')}</Label>
                <Select value={writeOffReason} onValueChange={setWriteOffReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WRITE_OFF_REASONS.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-3 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{t('returns.cannotUndo')}</p>
              </div>
              <Button
                variant="destructive" className="w-full gap-2"
                onClick={() => setShowConfirmWriteOff(true)}
              >
                <Trash2 className="w-4 h-4" /> {t('returns.confirmWriteOff')}
              </Button>
            </div>
          )}
        </div>

        {/* Restock confirm dialog */}
        <AlertDialog open={showConfirmRestock} onOpenChange={setShowConfirmRestock}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('returns.confirmRestock')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('returns.restockConfirmDesc', { name: ret.productName })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={doRestock}>{t('returns.restock')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Write-off confirm dialog */}
        <AlertDialog open={showConfirmWriteOff} onOpenChange={setShowConfirmWriteOff}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('returns.confirmWriteOff')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('returns.writeOffConfirmDesc', { name: ret.productName })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={doWriteOff} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('returns.writeOff')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  )
}

function ReturnsPage() {
  const { returns } = useMarketStore()
  const { t } = useI18n()
  const [activeReturn, setActiveReturn] = useState<MarketReturn | null>(null)
  const [filter, setFilter] = useState<ReturnStatus | 'all'>('all')

  const filtered = returns.filter(r => r.shopId === 'shop_mirpur' && (filter === 'all' || r.status === filter))

  const counts = returns.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const filterTabs: Array<ReturnStatus | 'all'> = ['all', 'pending', 'inspecting', 'restocked', 'sent_to_deals', 'written_off']

  return (
    <>
      {activeReturn && <ReturnSheet ret={activeReturn} onClose={() => setActiveReturn(null)} />}

      <div className="p-6 space-y-5 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{t('returns.title')}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t('returns.countInfo', {
                pending: returns.filter(r => r.status === 'pending').length,
                inspecting: returns.filter(r => r.status === 'inspecting').length,
              })}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s === 'all' ? t('common.all') : t(`returns.status.${s}` as any)}
              {s !== 'all' && counts[s] ? ` (${counts[s]})` : ''}
              {s === 'all' && ` (${returns.length})`}
            </button>
          ))}
        </div>

        {/* Queue table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <RotateCcw className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="font-medium text-muted-foreground">{t('returns.noReturns')}</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map(r => {
                const statusColor = STATUS_COLORS[r.status]
                const statusLabel = t(`returns.status.${r.status}` as any)
                const isActionable = r.status === 'pending' || r.status === 'inspecting'
                return (
                  <div
                    key={r.id}
                    className="flex items-start gap-4 p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setActiveReturn(r)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <RotateCcw className={`w-4 h-4 ${isActionable ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{r.productName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{r.variantLabel} · {r.customerName}</p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{r.reason}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-mono text-muted-foreground">{r.orderNumber}</span>
                        <span className="text-xs text-foreground font-medium">{fmt(r.unitPrice)}</span>
                        <span className="text-xs text-muted-foreground">{r.createdAt}</span>
                      </div>
                    </div>
                    {isActionable && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
