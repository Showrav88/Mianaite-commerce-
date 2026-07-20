import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Wallet, Smartphone, Banknote } from 'lucide-react'
import { useOfficeStore, walletBalance, type WalletTransaction, type WalletTxnType } from '@/lib/office-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { fmt } from '@/lib/admin-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const Route = createFileRoute('/admin/wallet')({
  component: WalletPage,
  head: () => ({ meta: [{ title: 'Wallet — 1to99' }] }),
})

const TYPE_LABELS: Record<WalletTxnType, { en: string; bn: string }> = {
  sell: { en: 'Sale income', bn: 'বিক্রয় আয়' },
  buy: { en: 'Purchase', bn: 'ক্রয়' },
  expense: { en: 'Expense', bn: 'খরচ' },
  loan: { en: 'Loan given', bn: 'ঋণ দেওয়া' },
  loan_repay: { en: 'Loan repayment', bn: 'ঋণ ফেরত' },
  salary: { en: 'Salary paid', bn: 'বেতন' },
  transfer: { en: 'Transfer', bn: 'ট্রান্সফার' },
}

function WalletPage() {
  const { wallet, addWalletTxn } = useOfficeStore()
  const { user } = useAuth()
  const { lang } = useI18n()
  const balance = walletBalance(wallet)

  const [type, setType] = useState<WalletTxnType>('expense')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<WalletTransaction['method']>('cash')
  const [note, setNote] = useState('')

  if (user?.role !== 'owner') {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {lang === 'bn' ? 'শুধু মালিক/অ্যাডমিন ওয়ালেট দেখতে পারবেন।' : 'Only the owner can manage the wallet.'}
      </div>
    )
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(amount)
    if (!n || n <= 0) return
    addWalletTxn({ type, amount: n, method, note: note || TYPE_LABELS[type][lang === 'bn' ? 'bn' : 'en'] })
    setAmount('')
    setNote('')
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-7 h-7 text-orange-500" />
          {lang === 'bn' ? 'ওয়ালেট ও হিসাব' : 'Wallet & accounts'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === 'bn'
            ? 'নগদ, bKash, Nagad — ম্যানুয়াল এন্ট্রি (API ছাড়া)। ক্রয়, বিক্রয়, ঋণ, খরচ, বেতন।'
            : 'Cash, bKash, Nagad — manual entry (no API). Track buy, sell, loans, expenses, salary.'}
        </p>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-emerald-50">
        <CardContent className="pt-6 pb-5">
          <p className="text-sm text-muted-foreground">{lang === 'bn' ? 'আনুমানিক ব্যালেন্স' : 'Estimated balance'}</p>
          <p className="text-3xl font-bold text-orange-600">{fmt(balance)}</p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{lang === 'bn' ? 'নতুন এন্ট্রি' : 'New entry'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{lang === 'bn' ? 'ধরন' : 'Type'}</Label>
                <Select value={type} onValueChange={v => setType(v as WalletTxnType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_LABELS) as WalletTxnType[]).map(k => (
                      <SelectItem key={k} value={k}>{lang === 'bn' ? TYPE_LABELS[k].bn : TYPE_LABELS[k].en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{lang === 'bn' ? 'পেমেন্ট' : 'Payment'}</Label>
                <Select value={method} onValueChange={v => setMethod(v as WalletTransaction['method'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{lang === 'bn' ? 'নগদ' : 'Cash'}</SelectItem>
                    <SelectItem value="bkash">bKash (QR / manual)</SelectItem>
                    <SelectItem value="nagad">Nagad (manual)</SelectItem>
                    <SelectItem value="bank">{lang === 'bn' ? 'ব্যাংক' : 'Bank'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{lang === 'bn' ? 'পরিমাণ (৳)' : 'Amount (৳)'}</Label>
                <Input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{lang === 'bn' ? 'নোট' : 'Note'}</Label>
                <Input value={note} onChange={e => setNote(e.target.value)} placeholder={lang === 'bn' ? 'যেমন: সাপ্লায়ার থেকে মাল' : 'e.g. stock from supplier'} />
              </div>
              <Button type="submit" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                {lang === 'bn' ? 'সংরক্ষণ' : 'Save entry'}
              </Button>
            </form>
            <div className="mt-4 flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5" /> Cash</span>
              <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> bKash / Nagad QR → manual</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">{lang === 'bn' ? 'লেনদেন' : 'Transactions'}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y max-h-[420px] overflow-y-auto">
              {wallet.map(tx => {
                const isIn = tx.type === 'sell' || tx.type === 'loan_repay'
                return (
                  <li key={tx.id} className="px-4 py-3 flex justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium">{lang === 'bn' ? TYPE_LABELS[tx.type].bn : TYPE_LABELS[tx.type].en}</p>
                      <p className="text-xs text-muted-foreground">{tx.note} · {tx.method} · {tx.createdAt}</p>
                    </div>
                    <span className={`font-bold shrink-0 ${isIn ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isIn ? '+' : '-'}{fmt(tx.amount)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
