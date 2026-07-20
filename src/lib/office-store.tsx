import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export type WalletTxnType = 'sell' | 'buy' | 'expense' | 'loan' | 'loan_repay' | 'salary' | 'transfer'

export interface WalletTransaction {
  id: string
  type: WalletTxnType
  amount: number
  method: 'cash' | 'bkash' | 'nagad' | 'bank'
  note: string
  createdAt: string
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

interface OfficeStoreCtx {
  wallet: WalletTransaction[]
  staff: StaffMember[]
  addWalletTxn: (txn: Omit<WalletTransaction, 'id' | 'createdAt'>) => void
  addStaff: (member: Omit<StaffMember, 'id'>) => void
  updateStaff: (id: string, patch: Partial<StaffMember>) => void
  paySalary: (staffId: string, amount: number, method: WalletTransaction['method']) => void
}

const WALLET_KEY = '1to99_wallet_v1'
const STAFF_KEY = '1to99_staff_v1'

const INITIAL_WALLET: WalletTransaction[] = [
  { id: 'w1', type: 'sell', amount: 45200, method: 'cash', note: 'Counter sales — morning shift', createdAt: '2026-05-19' },
  { id: 'w2', type: 'sell', amount: 12800, method: 'bkash', note: 'bKash (manual entry)', createdAt: '2026-05-19' },
  { id: 'w3', type: 'buy', amount: 85000, method: 'cash', note: 'Wholesale stock purchase', createdAt: '2026-05-18' },
  { id: 'w4', type: 'expense', amount: 3500, method: 'nagad', note: 'Shop rent (partial)', createdAt: '2026-05-17' },
  { id: 'w5', type: 'loan', amount: 20000, method: 'cash', note: 'Loan to supplier — 30 days', createdAt: '2026-05-15' },
]

const INITIAL_STAFF: StaffMember[] = [
  { id: 'st_1', name: 'Karim Ahmed', role: 'manager', phone: '01711234567', monthlySalary: 22000, lastPaidAt: '2026-05-01', active: true },
  { id: 'st_2', name: 'Sadia Islam', role: 'staff', phone: '01822334455', monthlySalary: 14000, lastPaidAt: '2026-05-01', active: true },
  { id: 'st_3', name: 'Rafiq Hossain', role: 'staff', phone: '01933445566', monthlySalary: 13500, active: true },
]

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const Ctx = createContext<OfficeStoreCtx | null>(null)

export function OfficeStoreProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletTransaction[]>(() => load(WALLET_KEY, INITIAL_WALLET))
  const [staff, setStaff] = useState<StaffMember[]>(() => load(STAFF_KEY, INITIAL_STAFF))

  useEffect(() => {
    try { localStorage.setItem(WALLET_KEY, JSON.stringify(wallet)) } catch { /* ignore */ }
  }, [wallet])
  useEffect(() => {
    try { localStorage.setItem(STAFF_KEY, JSON.stringify(staff)) } catch { /* ignore */ }
  }, [staff])

  const addWalletTxn = useCallback((txn: Omit<WalletTransaction, 'id' | 'createdAt'>) => {
    setWallet(prev => [
      {
        ...txn,
        id: `w_${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ])
  }, [])

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

  return (
    <Ctx.Provider value={{ wallet, staff, addWalletTxn, addStaff, updateStaff, paySalary }}>
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
    if (t.type === 'sell' || t.type === 'loan_repay') return sum + t.amount
    if (t.type === 'buy' || t.type === 'expense' || t.type === 'loan' || t.type === 'salary' || t.type === 'transfer') return sum - t.amount
    return sum
  }, 0)
}
