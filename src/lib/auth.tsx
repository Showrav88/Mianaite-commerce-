import { createContext, useContext, useState, type ReactNode } from 'react'

export type UserRole = 'owner' | 'manager' | 'staff'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  shopId: 'shop_6'
  shopName: '1to99'
}

interface AuthCtx {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

const Ctx = createContext<AuthCtx>({ user: null, login: () => {}, logout: () => {} })

const STORAGE_KEY = 'auth_user'

function readStorage(): AuthUser | null {
  try {
    if (typeof window === 'undefined') return null
    const s = localStorage.getItem(STORAGE_KEY)
    if (!s) return null
    const parsed = JSON.parse(s) as AuthUser
    if (parsed.shopId !== 'shop_6') return null
    return parsed
  } catch {
    return null
  }
}

export const DEMO_PASSWORD = '1234567@'

export const DEMO_ACCOUNTS: AuthUser[] = [
  {
    id: 'own_1',
    name: 'Shop Owner',
    email: 'owner@1to99.com',
    role: 'owner',
    shopId: 'shop_6',
    shopName: '1to99',
  },
  {
    id: 'mgr_1',
    name: 'Manager',
    email: 'manager@1to99.com',
    role: 'manager',
    shopId: 'shop_6',
    shopName: '1to99',
  },
  {
    id: 'stf_1',
    name: 'Counter Staff',
    email: 'staff@1to99.com',
    role: 'staff',
    shopId: 'shop_6',
    shopName: '1to99',
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStorage)

  function login(u: AuthUser) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)) } catch {}
    setUser(u)
  }

  function logout() {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    setUser(null)
  }

  return (
    <Ctx.Provider value={{ user, login, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
