import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export type WalletTxnType =
  | 'deposit'
  | 'sell'
  | 'buy'
  | 'expense'
  | 'loan'
  | 'loan_repay'
  | 'salary'
  | 'transfer'

export interface WalletTransaction {
  id: string
  type: WalletTxnType
  amount: number
  method: 'cash' | 'bkash' | 'nagad' | 'bank'
  note: string
  createdAt: string
  dealId?: string
  supplierId?: string
  /** Purchase breakdown for P/L reports */
  meta?: {
    merchandise?: number
    travelExpense?: number
    driverBill?: number
    otherExpense?: number
  }
}

export interface StaffMember {
  id: string
  name: string
  role: 'manager' | 'staff'
  phone: string
  monthlySalary: number
  lastPaidAt?: string
  active: boolean
}

export interface Supplier {
  id: string
  name: string
  phone: string
  address?: string
  notes?: string
}

export interface SupplierDealLine {
  name: string
  sku: string
  qty: number
  unitCost: number
  salePrice: number
  categoryId: string
}

export type SupplierDealStatus = 'awaiting_payment' | 'paid' | 'received'

export interface SupplierDeal {
  id: string
  supplierId: string
  reference: string
  status: SupplierDealStatus
  items: SupplierDealLine[]
  travelExpense: number
  driverBill: number
  otherExpense: number
  paidAt?: string
  paymentMethod?: WalletTransaction['method']
  walletTxnId?: string
  productIdsCreated?: string[]
  /** Product id per deal line index (same order as items). */
  productIdsByLine?: string[]
  createdAt: string
}

interface OfficeStoreCtx {
  wallet: WalletTransaction[]
  staff: StaffMember[]
  suppliers: Supplier[]
  supplierDeals: SupplierDeal[]
  addWalletTxn: (txn: Omit<WalletTransaction, 'id' | 'createdAt'>) => WalletTransaction
  depositWallet: (amount: number, method: WalletTransaction['method'], note?: string) => void
  addStaff: (member: Omit<StaffMember, 'id'>) => void
  updateStaff: (id: string, patch: Partial<StaffMember>) => void
  paySalary: (staffId: string, amount: number, method: WalletTransaction['method']) => void
  addSupplier: (s: Omit<Supplier, 'id'>) => Supplier
  updateSupplier: (id: string, patch: Partial<Supplier>) => void
  createSupplierDeal: (deal: Omit<SupplierDeal, 'id' | 'status' | 'createdAt'>) => SupplierDeal
  paySupplierDeal: (
    dealId: string,
    method: WalletTransaction['method']
  ) => { ok: true } | { ok: false; reason: 'not_found' | 'wrong_status' | 'insufficient_balance' }
  markDealReceived: (dealId: string, productIds: string[]) => void
  registerDealLineProduct: (dealId: string, lineIndex: number, productId: string) => void
}

const WALLET_KEY = '1to99_wallet_v2'
const STAFF_KEY = '1to99_staff_v2'
const SUPPLIERS_KEY = '1to99_suppliers_v2'
const DEALS_KEY = '1to99_supplier_deals_v2'

const INITIAL_WALLET: WalletTransaction[] = []
const INITIAL_STAFF: StaffMember[] = []
const INITIAL_SUPPLIERS: Supplier[] = []
const INITIAL_DEALS: SupplierDeal[] = []

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function dealMerchandiseTotal(deal: SupplierDeal): number {
  return deal.items.reduce((s, i) => s + i.qty * i.unitCost, 0)
}

export function dealGrandTotal(deal: SupplierDeal): number {
  return dealMerchandiseTotal(deal) + deal.travelExpense + deal.driverBill + deal.otherExpense
}

const Ctx = createContext<OfficeStoreCtx | null>(null)

export function OfficeStoreProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletTransaction[]>(() => load(WALLET_KEY, INITIAL_WALLET))
  const [staff, setStaff] = useState<StaffMember[]>(() => load(STAFF_KEY, INITIAL_STAFF))
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => load(SUPPLIERS_KEY, INITIAL_SUPPLIERS))
  const [supplierDeals, setSupplierDeals] = useState<SupplierDeal[]>(() => load(DEALS_KEY, INITIAL_DEALS))

  useEffect(() => {
    try { localStorage.setItem(WALLET_KEY, JSON.stringify(wallet)) } catch { /* ignore */ }
  }, [wallet])
  useEffect(() => {
    try { localStorage.setItem(STAFF_KEY, JSON.stringify(staff)) } catch { /* ignore */ }
  }, [staff])
  useEffect(() => {
    try { localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers)) } catch { /* ignore */ }
  }, [suppliers])
  useEffect(() => {
    try { localStorage.setItem(DEALS_KEY, JSON.stringify(supplierDeals)) } catch { /* ignore */ }
  }, [supplierDeals])

  const addWalletTxn = useCallback((txn: Omit<WalletTransaction, 'id' | 'createdAt'>) => {
    const row: WalletTransaction = {
      ...txn,
      id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setWallet(prev => [row, ...prev])
    return row
  }, [])

  const depositWallet = useCallback((amount: number, method: WalletTransaction['method'], note?: string) => {
    if (amount <= 0) return
    addWalletTxn({
      type: 'deposit',
      amount,
      method,
      note: note || 'Manual wallet deposit',
    })
  }, [addWalletTxn])

  const addStaff = useCallback((member: Omit<StaffMember, 'id'>) => {
    setStaff(prev => [...prev, { ...member, id: `st_${Date.now()}` }])
  }, [])

  const updateStaff = useCallback((id: string, patch: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const paySalary = useCallback((staffId: string, amount: number, method: WalletTransaction['method']) => {
    const member = staff.find(s => s.id === staffId)
    if (!member) return
    addWalletTxn({ type: 'salary', amount, method, note: `Salary — ${member.name}` })
    updateStaff(staffId, { lastPaidAt: new Date().toISOString().slice(0, 10) })
  }, [staff, addWalletTxn, updateStaff])

  const addSupplier = useCallback((s: Omit<Supplier, 'id'>) => {
    const row: Supplier = { ...s, id: `sup_${Date.now()}` }
    setSuppliers(prev => [...prev, row])
    return row
  }, [])

  const updateSupplier = useCallback((id: string, patch: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const createSupplierDeal = useCallback((deal: Omit<SupplierDeal, 'id' | 'status' | 'createdAt'>) => {
    const row: SupplierDeal = {
      ...deal,
      id: `deal_${Date.now()}`,
      status: 'awaiting_payment',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setSupplierDeals(prev => [row, ...prev])
    return row
  }, [])

  const paySupplierDeal = useCallback((
    dealId: string,
    method: WalletTransaction['method'],
  ): { ok: true } | { ok: false; reason: 'not_found' | 'wrong_status' | 'insufficient_balance' } => {
    const deal = supplierDeals.find(d => d.id === dealId)
    if (!deal) return { ok: false, reason: 'not_found' }
    if (deal.status !== 'awaiting_payment') return { ok: false, reason: 'wrong_status' }
    const total = dealGrandTotal(deal)
    const balance = walletBalance(wallet)
    if (balance < total) return { ok: false, reason: 'insufficient_balance' }
    const supplier = suppliers.find(s => s.id === deal.supplierId)
    const merchandise = dealMerchandiseTotal(deal)
    const txn = addWalletTxn({
      type: 'buy',
      amount: total,
      method,
      note: `Supplier deal ${deal.reference} — ${supplier?.name ?? 'Supplier'}`,
      dealId: deal.id,
      supplierId: deal.supplierId,
      meta: {
        merchandise,
        travelExpense: deal.travelExpense,
        driverBill: deal.driverBill,
        otherExpense: deal.otherExpense,
      },
    })
    setSupplierDeals(prev => prev.map(d => d.id === dealId
      ? { ...d, status: 'paid', paidAt: txn.createdAt, paymentMethod: method, walletTxnId: txn.id }
      : d))
    return { ok: true }
  }, [supplierDeals, suppliers, wallet, addWalletTxn])

  const markDealReceived = useCallback((dealId: string, productIds: string[]) => {
    setSupplierDeals(prev => prev.map(d => d.id === dealId
      ? { ...d, status: 'received', productIdsCreated: productIds }
      : d))
  }, [])

  const registerDealLineProduct = useCallback((dealId: string, lineIndex: number, productId: string) => {
    setSupplierDeals(prev => prev.map(d => {
      if (d.id !== dealId) return d
      const byLine = [...(d.productIdsByLine ?? d.items.map(() => ''))]
      if (lineIndex >= 0 && lineIndex < byLine.length) byLine[lineIndex] = productId
      const productIds = byLine.filter(Boolean)
      const allDone = d.items.every((it, i) => {
        if (!it.name.trim() || !it.sku.trim()) return true
        return Boolean(byLine[i])
      })
      return {
        ...d,
        productIdsByLine: byLine,
        productIdsCreated: productIds,
        status: allDone ? 'received' as const : d.status,
      }
    }))
  }, [])

  return (
    <Ctx.Provider value={{
      wallet,
      staff,
      suppliers,
      supplierDeals,
      addWalletTxn,
      depositWallet,
      addStaff,
      updateStaff,
      paySalary,
      addSupplier,
      updateSupplier,
      createSupplierDeal,
      paySupplierDeal,
      markDealReceived,
      registerDealLineProduct,
    }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useOfficeStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useOfficeStore must be used within OfficeStoreProvider')
  return ctx
}

export function walletBalance(transactions: WalletTransaction[]): number {
  return transactions.reduce((sum, t) => {
    if (t.type === 'deposit' || t.type === 'sell' || t.type === 'loan_repay') return sum + t.amount
    if (t.type === 'buy' || t.type === 'expense' || t.type === 'loan' || t.type === 'salary' || t.type === 'transfer') return sum - t.amount
    return sum
  }, 0)
}
