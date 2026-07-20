import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Truck, Plus, CreditCard, PackageCheck, AlertCircle, ExternalLink } from 'lucide-react'
import {
  useOfficeStore,
  walletBalance,
  dealGrandTotal,
  dealMerchandiseTotal,
  type SupplierDeal,
  type SupplierDealLine,
} from '@/lib/office-store'
import { useAdminStore, ALL_CATEGORIES, fmt } from '@/lib/admin-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { buildProductsFromDeal } from '@/lib/pos-stats'
import { ConfirmDialog } from '@/components/office/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/admin/suppliers')({
  component: SuppliersPage,
  head: () => ({ meta: [{ title: 'Suppliers — 1to99' }] }),
})

const emptyLine = (): SupplierDealLine => ({
  name: '',
  sku: '',
  qty: 1,
  unitCost: 0,
  salePrice: 0,
  categoryId: 'cat_books',
})

function SuppliersPage() {
  const navigate = useNavigate()
  const {
    suppliers,
    supplierDeals,
    wallet,
    addSupplier,
    createSupplierDeal,
    paySupplierDeal,
    markDealReceived,
  } = useOfficeStore()
  const { products, setProducts } = useAdminStore()
  const { user } = useAuth()
  const { tx } = useI18n()
  const balance = walletBalance(wallet)

  const [tab, setTab] = useState<'suppliers' | 'deals'>('deals')
  const [supName, setSupName] = useState('')
  const [supPhone, setSupPhone] = useState('')
  const [supAddress, setSupAddress] = useState('')

  const [dealSupplierId, setDealSupplierId] = useState(suppliers[0]?.id ?? '')
  const [dealRef, setDealRef] = useState('')
  const [lines, setLines] = useState<SupplierDealLine[]>([emptyLine()])
  const [travel, setTravel] = useState('0')
  const [driver, setDriver] = useState('0')
  const [other, setOther] = useState('0')
  const [payMethod, setPayMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [supplierConfirmOpen, setSupplierConfirmOpen] = useState(false)
  const [dealConfirmOpen, setDealConfirmOpen] = useState(false)
  const [payDealTarget, setPayDealTarget] = useState<SupplierDeal | null>(null)
  const [receiveDealTarget, setReceiveDealTarget] = useState<SupplierDeal | null>(null)

  if (user?.role === 'staff') {
    return <div className="p-6 text-sm text-muted-foreground">{tx('Owner or manager only.', 'শুধু মালিক/ম্যানেজার।')}</div>
  }

  function flash(type: 'ok' | 'err', text: string) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  function addSupplierSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supName.trim() || !supPhone.trim()) return
    setSupplierConfirmOpen(true)
  }

  function executeAddSupplier() {
    addSupplier({ name: supName.trim(), phone: supPhone.trim(), address: supAddress.trim() || undefined })
    setSupName('')
    setSupPhone('')
    setSupAddress('')
    flash('ok', tx('Supplier saved.', 'সাপ্লায়ার সংরক্ষিত।'))
  }

  function createDealSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dealSupplierId || !dealRef.trim()) return
    const validLines = lines.filter(l => l.name.trim() && l.sku.trim() && l.qty > 0)
    if (validLines.length === 0) return
    setDealConfirmOpen(true)
  }

  function executeCreateDeal() {
    const validLines = lines.filter(l => l.name.trim() && l.sku.trim() && l.qty > 0)
    createSupplierDeal({
      supplierId: dealSupplierId,
      reference: dealRef.trim(),
      items: validLines.map(l => ({
        ...l,
        name: l.name.trim(),
        sku: l.sku.trim(),
        salePrice: l.salePrice || Math.round(l.unitCost * 1.35),
      })),
      travelExpense: Number(travel) || 0,
      driverBill: Number(driver) || 0,
      otherExpense: Number(other) || 0,
    })
    setDealRef('')
    setLines([emptyLine()])
    setTravel('0')
    setDriver('0')
    setOther('0')
    flash('ok', tx('Deal saved. Pay wallet when ready — stock is a separate step.', 'ডিল সংরক্ষিত। প্রস্তুত হলে পেমেন্ট করুন — স্টক আলাদা ধাপ।'))
  }

  function executePayDeal() {
    if (!payDealTarget) return
    const res = paySupplierDeal(payDealTarget.id, payMethod)
    if (!res.ok) {
      if (res.reason === 'insufficient_balance') flash('err', tx('Insufficient wallet balance.', 'ওয়ালেটে পর্যাপ্ত টাকা নেই।'))
      else flash('err', tx('Cannot pay this deal.', 'এই ডিল পরিশোধ করা যাচ্ছে না।'))
      return
    }
    flash('ok', tx('Payment recorded. Use “Receive to stock” when goods arrive.', 'পেমেন্ট রেকর্ড হয়েছে। মাল এলে “স্টকে নিন” ব্যবহার করুন।'))
  }

  function executeReceiveStock() {
    const deal = receiveDealTarget
    if (!deal || deal.status !== 'paid' || !user?.shopId) return
    const newProducts = buildProductsFromDeal(deal, user.shopId)
    setProducts([...products, ...newProducts])
    markDealReceived(deal.id, newProducts.map(p => p.id))
    flash('ok', tx('Products created and stock added.', 'পণ্য তৈরি ও স্টক যোগ হয়েছে।'))
  }

  function goManualStock() {
    navigate({ to: '/admin/catalog/products/$id', params: { id: 'new' } })
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      awaiting_payment: 'bg-amber-100 text-amber-800',
      paid: 'bg-blue-100 text-blue-800',
      received: 'bg-emerald-100 text-emerald-800',
    }
    const labels: Record<string, [string, string]> = {
      awaiting_payment: ['Awaiting payment', 'পেমেন্ট বাকি'],
      paid: ['Paid — stock pending', 'পেইড — স্টক বাকি'],
      received: ['In stock', 'স্টকে আছে'],
    }
    const [en, bn] = labels[status] ?? [status, status]
    return <Badge className={map[status] ?? ''}>{tx(en, bn)}</Badge>
  }

  const payTotal = payDealTarget ? dealGrandTotal(payDealTarget) : 0

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="w-7 h-7 text-orange-500" />
          {tx('Suppliers & purchase deals', 'সাপ্লায়ার ও ক্রয় ডিল')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
          {tx(
            '1) Deposit wallet → 2) Add supplier → 3) Create deal → 4) Pay deal (wallet) → 5) Receive stock. Payment and stock are separate steps.',
            '১) ওয়ালেটে জমা → ২) সাপ্লায়ার → ৩) ডিল → ৪) পেমেন্ট → ৫) স্টক। পেমেন্ট ও স্টক আলাদা।',
          )}
        </p>
        <p className="text-sm mt-2">{tx('Wallet balance', 'ওয়ালেট')}: <strong className="text-orange-600">{fmt(balance)}</strong></p>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-2 text-sm flex items-center gap-2 ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          {msg.text}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant={tab === 'deals' ? 'default' : 'outline'} onClick={() => setTab('deals')}>{tx('Deals', 'ডিল')}</Button>
        <Button variant={tab === 'suppliers' ? 'default' : 'outline'} onClick={() => setTab('suppliers')}>{tx('Suppliers', 'সাপ্লায়ার')}</Button>
      </div>

      {tab === 'suppliers' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">{tx('Add supplier', 'সাপ্লায়ার যোগ')}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={addSupplierSubmit} className="space-y-3">
                <div><Label>{tx('Name', 'নাম')}</Label><Input value={supName} onChange={e => setSupName(e.target.value)} required /></div>
                <div><Label>{tx('Phone', 'ফোন')}</Label><Input value={supPhone} onChange={e => setSupPhone(e.target.value)} required /></div>
                <div><Label>{tx('Address', 'ঠিকানা')}</Label><Input value={supAddress} onChange={e => setSupAddress(e.target.value)} /></div>
                <Button type="submit" className="gap-2"><Plus className="w-4 h-4" />{tx('Review & save', 'দেখুন ও সংরক্ষণ')}</Button>
              </form>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">{tx('Supplier list', 'তালিকা')}</CardTitle></CardHeader>
            <CardContent className="p-0">
              {suppliers.length === 0 ? (
                <p className="px-4 py-8 text-sm text-muted-foreground text-center">{tx('No suppliers yet.', 'এখনো সাপ্লায়ার নেই।')}</p>
              ) : (
                <ul className="divide-y">
                  {suppliers.map(s => (
                    <li key={s.id} className="px-4 py-3">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.phone}{s.address ? ` · ${s.address}` : ''}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'deals' && (
        <>
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">{tx('New purchase deal', 'নতুন ক্রয় ডিল')}</CardTitle></CardHeader>
            <CardContent>
              {suppliers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{tx('Add a supplier first.', 'আগে সাপ্লায়ার যোগ করুন।')}</p>
              ) : (
                <form onSubmit={createDealSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>{tx('Supplier', 'সাপ্লায়ার')}</Label>
                      <Select value={dealSupplierId || suppliers[0]?.id} onValueChange={setDealSupplierId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>{tx('Reference / PO', 'রেফারেন্স')}</Label><Input value={dealRef} onChange={e => setDealRef(e.target.value)} placeholder="PO-2026-0001" required /></div>
                  </div>
                  <div className="space-y-2">
                    <Label>{tx('Line items', 'পণ্যের লাইন')}</Label>
                    {lines.map((line, i) => (
                      <div key={i} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end border rounded-lg p-2">
                        <Input placeholder={tx('Name', 'নাম')} value={line.name} onChange={e => setLines(prev => prev.map((l, j) => j === i ? { ...l, name: e.target.value } : l))} />
                        <Input placeholder="SKU" value={line.sku} onChange={e => setLines(prev => prev.map((l, j) => j === i ? { ...l, sku: e.target.value } : l))} />
                        <Input type="number" min={1} placeholder="Qty" value={line.qty || ''} onChange={e => setLines(prev => prev.map((l, j) => j === i ? { ...l, qty: Number(e.target.value) } : l))} />
                        <Input type="number" min={0} placeholder={tx('Cost', 'ক্রয়')} value={line.unitCost || ''} onChange={e => setLines(prev => prev.map((l, j) => j === i ? { ...l, unitCost: Number(e.target.value) } : l))} />
                        <Input type="number" min={0} placeholder={tx('Sale', 'বিক্রয়')} value={line.salePrice || ''} onChange={e => setLines(prev => prev.map((l, j) => j === i ? { ...l, salePrice: Number(e.target.value) } : l))} />
                        <Select value={line.categoryId} onValueChange={v => setLines(prev => prev.map((l, j) => j === i ? { ...l, categoryId: v } : l))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ALL_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setLines(prev => [...prev, emptyLine()])}>{tx('Add line', 'লাইন যোগ')}</Button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div><Label>{tx('Travel expense', 'ভ্রমণ খরচ')}</Label><Input type="number" min={0} value={travel} onChange={e => setTravel(e.target.value)} /></div>
                    <div><Label>{tx('Driver bill', 'ড্রাইভার বিল')}</Label><Input type="number" min={0} value={driver} onChange={e => setDriver(e.target.value)} /></div>
                    <div><Label>{tx('Other', 'অন্যান্য')}</Label><Input type="number" min={0} value={other} onChange={e => setOther(e.target.value)} /></div>
                  </div>
                  <Button type="submit" className="gap-2"><Plus className="w-4 h-4" />{tx('Review & create deal', 'দেখুন ও ডিল তৈরি')}</Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{tx('Deals', 'ডিল')}</CardTitle>
              <div className="flex items-center gap-2 text-xs">
                <span>{tx('Pay with', 'পেমেন্ট')}</span>
                <Select value={payMethod} onValueChange={v => setPayMethod(v as typeof payMethod)}>
                  <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {supplierDeals.length === 0 ? (
                <p className="px-4 py-8 text-sm text-muted-foreground text-center">{tx('No deals yet.', 'এখনো ডিল নেই।')}</p>
              ) : (
                <ul className="divide-y">
                  {supplierDeals.map(deal => {
                    const sup = suppliers.find(s => s.id === deal.supplierId)
                    const merch = dealMerchandiseTotal(deal)
                    const total = dealGrandTotal(deal)
                    return (
                      <li key={deal.id} className="px-4 py-4 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{deal.reference}</p>
                            <p className="text-xs text-muted-foreground">{sup?.name} · {deal.createdAt}</p>
                          </div>
                          {statusBadge(deal.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tx('Merchandise', 'মাল')}: {fmt(merch)} · {tx('Travel', 'ভ্রমণ')}: {fmt(deal.travelExpense)} · {tx('Driver', 'ড্রাইভার')}: {fmt(deal.driverBill)} · {tx('Total', 'মোট')}: <strong>{fmt(total)}</strong>
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {deal.status === 'awaiting_payment' && (
                            <>
                              <Button size="sm" className="gap-1" onClick={() => setPayDealTarget(deal)}>
                                <CreditCard className="w-3.5 h-3.5" />
                                {tx('Pay from wallet', 'ওয়ালেটে পেমেন্ট')}
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1" onClick={goManualStock}>
                                <ExternalLink className="w-3.5 h-3.5" />
                                {tx('Add stock manually (products)', 'ম্যানুয়াল স্টক — পণ্য পাতা')}
                              </Button>
                            </>
                          )}
                          {deal.status === 'paid' && (
                            <Button size="sm" variant="secondary" className="gap-1" onClick={() => setReceiveDealTarget(deal)}>
                              <PackageCheck className="w-3.5 h-3.5" />
                              {tx('Receive to stock', 'স্টকে নিন')}
                            </Button>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <ConfirmDialog
        open={supplierConfirmOpen}
        onOpenChange={setSupplierConfirmOpen}
        title={tx('Save supplier?', 'সাপ্লায়ার সংরক্ষণ?')}
        confirmLabel={tx('Yes, save', 'হ্যাঁ')}
        cancelLabel={tx('Cancel', 'বাতিল')}
        onConfirm={executeAddSupplier}
      >
        <p><strong>{supName}</strong> · {supPhone}</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dealConfirmOpen}
        onOpenChange={setDealConfirmOpen}
        title={tx('Create purchase deal?', 'ক্রয় ডিল তৈরি?')}
        description={tx('This does not charge the wallet yet. You pay in a separate step.', 'এখনই ওয়ালেট কাটবে না। পেমেন্ট আলাদা ধাপ।')}
        confirmLabel={tx('Yes, create deal', 'হ্যাঁ, ডিল তৈরি')}
        cancelLabel={tx('Cancel', 'বাতিল')}
        onConfirm={executeCreateDeal}
      >
        <p>{tx('Reference', 'রেফারেন্স')}: <strong>{dealRef}</strong></p>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!payDealTarget}
        onOpenChange={open => { if (!open) setPayDealTarget(null) }}
        title={tx('Pay supplier deal?', 'সাপ্লায়ার ডিল পরিশোধ?')}
        description={tx(
          'Wallet will be charged. Stock is NOT added until you use “Receive to stock”.',
          'ওয়ালেট থেকে কাটা হবে। “স্টকে নিন” না করা পর্যন্ত স্টক যোগ হবে না।',
        )}
        confirmLabel={tx('Yes, pay', 'হ্যাঁ, পরিশোধ')}
        cancelLabel={tx('Cancel', 'বাতিল')}
        variant="destructive"
        onConfirm={executePayDeal}
      >
        {payDealTarget && (
          <>
            <p>{payDealTarget.reference}</p>
            <p className="font-bold text-red-600">{fmt(payTotal)}</p>
            <p className="text-xs text-muted-foreground">
              {tx('Balance after', 'পরবর্তী ব্যালেন্স')}: {fmt(balance - payTotal)}
            </p>
          </>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={!!receiveDealTarget}
        onOpenChange={open => { if (!open) setReceiveDealTarget(null) }}
        title={tx('Receive goods to stock?', 'স্টকে নিন?')}
        description={tx(
          'Creates products from this deal and adds quantities. Payment was already recorded.',
          'ডিল থেকে পণ্য তৈরি হবে ও স্টক যোগ হবে। পেমেন্ট আগেই হয়েছে।',
        )}
        confirmLabel={tx('Yes, add stock', 'হ্যাঁ, স্টক যোগ')}
        cancelLabel={tx('Cancel', 'বাতিল')}
        onConfirm={executeReceiveStock}
      >
        {receiveDealTarget && (
          <ul className="list-disc pl-4 text-muted-foreground">
            {receiveDealTarget.items.map((it, i) => (
              <li key={i}>{it.name} × {it.qty}</li>
            ))}
          </ul>
        )}
      </ConfirmDialog>
    </div>
  )
}
