import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Wallet, Smartphone, Banknote, ArrowDownToLine } from 'lucide-react'
import { useOfficeStore, walletBalance, type WalletTransaction, type WalletTxnType } from '@/lib/office-store'
import { useAuth } from '@/lib/auth'
import { useI18n, type Key } from '@/lib/i18n'
import { fmt } from '@/lib/admin-store'
import { ConfirmDialog } from '@/components/office/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const Route = createFileRoute('/admin/wallet')({
  component: WalletPage,
  head: () => ({ meta: [{ title: 'Wallet — 1to99' }] }),
})

const TYPE_KEYS: Record<WalletTxnType, Key> = {
  deposit: 'wallet.type.deposit',
  sell: 'wallet.type.sell',
  buy: 'wallet.type.buy',
  expense: 'wallet.type.expense',
  loan: 'wallet.type.loan',
  loan_repay: 'wallet.type.loan_repay',
  salary: 'wallet.type.salary',
  transfer: 'wallet.type.transfer',
}

function WalletPage() {
  const { wallet, addWalletTxn, depositWallet } = useOfficeStore()
  const { user } = useAuth()
  const { t, tx } = useI18n()
  const balance = walletBalance(wallet)

  const [mode, setMode] = useState<'deposit' | 'other'>('deposit')
  const [type, setType] = useState<WalletTxnType>('expense')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<WalletTransaction['method']>('cash')
  const [note, setNote] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (user?.role !== 'owner') {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {t('wallet.ownerOnly')}
      </div>
    )
  }

  function requestSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(amount)
    if (!n || n <= 0) return
    if (mode === 'other' && (type === 'buy' || type === 'expense' || type === 'loan' || type === 'salary' || type === 'transfer')) {
      if (balance < n) {
        alert(tx('Insufficient balance for this outflow.', 'এই খরচের জন্য ব্যালেন্স নেই।'))
        return
      }
    }
    setConfirmOpen(true)
  }

  function executeSubmit() {
    const n = Number(amount)
    if (!n || n <= 0) return
    if (mode === 'deposit') {
      depositWallet(n, method, note || t('wallet.type.deposit'))
    } else {
      addWalletTxn({ type, amount: n, method, note: note || t(TYPE_KEYS[type]) })
    }
    setAmount('')
    setNote('')
  }

  const isOutflow = mode === 'other' && type !== 'sell' && type !== 'loan_repay' && type !== 'deposit'

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-7 h-7 text-orange-500" />
          {t('wallet.title')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {tx(
            'Start with a manual deposit, then pay suppliers and track sales. No demo money.',
            'ম্যানুয়াল জমা দিয়ে শুরু করুন, তারপর সাপ্লায়ার পরিশোধ ও বিক্রয় ট্র্যাক করুন।',
          )}
        </p>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-emerald-50">
        <CardContent className="pt-6 pb-5">
          <p className="text-sm text-muted-foreground">{t('wallet.balance')}</p>
          <p className="text-3xl font-bold text-orange-600">{fmt(balance)}</p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {mode === 'deposit' ? <ArrowDownToLine className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {mode === 'deposit' ? t('wallet.depositTitle') : t('wallet.newEntry')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button type="button" size="sm" variant={mode === 'deposit' ? 'default' : 'outline'} onClick={() => setMode('deposit')}>
                {t('wallet.type.deposit')}
              </Button>
              <Button type="button" size="sm" variant={mode === 'other' ? 'default' : 'outline'} onClick={() => setMode('other')}>
                {tx('Other entry', 'অন্যান্য')}
              </Button>
            </div>
            <form onSubmit={requestSubmit} className="space-y-4">
              {mode === 'other' && (
                <div className="space-y-1.5">
                  <Label>{t('wallet.type')}</Label>
                  <Select value={type} onValueChange={v => setType(v as WalletTxnType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(TYPE_KEYS) as WalletTxnType[]).filter(k => k !== 'deposit').map(k => (
                        <SelectItem key={k} value={k}>{t(TYPE_KEYS[k])}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>{t('wallet.payment')}</Label>
                <Select value={method} onValueChange={v => setMethod(v as WalletTransaction['method'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t('wallet.pay.cash')}</SelectItem>
                    <SelectItem value="bkash">{t('wallet.pay.bkashHint')}</SelectItem>
                    <SelectItem value="nagad">{t('wallet.pay.nagadHint')}</SelectItem>
                    <SelectItem value="bank">{t('wallet.pay.bank')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('wallet.amount')}</Label>
                <Input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t('wallet.note')}</Label>
                <Input value={note} onChange={e => setNote(e.target.value)} placeholder={t('wallet.notePlaceholder')} />
              </div>
              <Button type="submit" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                {tx('Review & save', 'দেখুন ও সংরক্ষণ')}
              </Button>
            </form>
            <div className="mt-4 flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5" /> {t('wallet.pay.cash')}</span>
              <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> bKash / Nagad</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">{t('wallet.transactions')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {wallet.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted-foreground text-center">
                {tx('No transactions yet. Add a deposit to begin.', 'এখনো লেনদেন নেই। জমা দিয়ে শুরু করুন।')}
              </p>
            ) : (
              <ul className="divide-y max-h-[420px] overflow-y-auto">
                {wallet.map(wtxn => {
                  const isIn = wtxn.type === 'deposit' || wtxn.type === 'sell' || wtxn.type === 'loan_repay'
                  return (
                    <li key={wtxn.id} className="px-4 py-3 flex justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium">{t(TYPE_KEYS[wtxn.type])}</p>
                        <p className="text-xs text-muted-foreground">{wtxn.note} · {wtxn.method} · {wtxn.createdAt}</p>
                      </div>
                      <span className={`font-bold shrink-0 ${isIn ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isIn ? '+' : '-'}{fmt(wtxn.amount)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={mode === 'deposit'
          ? tx('Confirm deposit', 'জমা নিশ্চিত করুন')
          : tx('Confirm wallet entry', 'লেনদেন নিশ্চিত করুন')}
        description={tx(
          'This updates your real wallet balance in this browser. Please check the amount.',
          'এটি এই ব্রাউজারে ওয়ালেট ব্যালেন্স বদলাবে। পরিমাণ যাচাই করুন।',
        )}
        confirmLabel={tx('Yes, save', 'হ্যাঁ, সংরক্ষণ')}
        cancelLabel={tx('Cancel', 'বাতিল')}
        variant={isOutflow ? 'destructive' : 'default'}
        onConfirm={executeSubmit}
      >
        <p>
          <span className="text-muted-foreground">{tx('Amount', 'পরিমাণ')}: </span>
          <strong>{fmt(Number(amount) || 0)}</strong>
        </p>
        <p>
          <span className="text-muted-foreground">{tx('Type', 'ধরন')}: </span>
          {mode === 'deposit' ? t('wallet.type.deposit') : t(TYPE_KEYS[type])}
        </p>
        {isOutflow && (
          <p className="text-red-600 text-xs">
            {tx('Balance after', 'পরবর্তী ব্যালেন্স')}: {fmt(balance - (Number(amount) || 0))}
          </p>
        )}
      </ConfirmDialog>
    </div>
  )
}
