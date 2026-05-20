import { createContext, useContext, useState, type ReactNode } from 'react'

export type UserRole = 'super_admin' | 'shop_admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  shopId?: string
  shopName?: string
}

interface AuthCtx {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

const Ctx = createContext<AuthCtx>({ user: null, login: () => {}, logout: () => {} })

export const DEMO_ACCOUNTS: AuthUser[] = [
  { id: 'sa_1', name: 'Super Admin', email: 'superadmin@aiteshops.com', role: 'super_admin' },
  { id: 'adm_1', name: 'Rahim Tech', email: 'rahim@techhub.bd', role: 'shop_admin', shopId: 'shop_1', shopName: 'TechHub BD' },
  { id: 'adm_2', name: 'Fatema Fashion', email: 'fatema@fashionista.bd', role: 'shop_admin', shopId: 'shop_2', shopName: 'Fashionista BD' },
  { id: 'adm_3', name: 'Karim Groceries', email: 'karim@freshmart.bd', role: 'shop_admin', shopId: 'shop_3', shopName: 'FreshMart' },
  { id: 'adm_5', name: 'Sohag', email: 'Sohag.moodon@gmail.com', role: 'shop_admin', shopId: 'shop_5', shopName: 'Mood On' },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  return (
    <Ctx.Provider value={{ user, login: setUser, logout: () => setUser(null) }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
