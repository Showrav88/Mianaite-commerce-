import { createContext, useContext, useState, type ReactNode } from 'react'

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  shopId: string
  registeredAt: string
  lastActivity: string
  totalOrders: number
  totalSpent: number
  source: 'direct' | 'homepage' | 'search' | 'referral'
}

export interface CustomerOrder {
  id: string
  customerId: string
  shopId: string
  items: { productId: string; name: string; qty: number; price: number }[]
  total: number
  address: string
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  placedAt: string
}

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Abdur Rahman', phone: '01711111111', email: 'abdur@gmail.com', shopId: 'shop_1', registeredAt: '2026-04-10', lastActivity: '2026-05-18', totalOrders: 3, totalSpent: 267997, source: 'direct' },
  { id: 'c2', name: 'Hosne Ara', phone: '01812222222', shopId: 'shop_1', registeredAt: '2026-04-22', lastActivity: '2026-05-18', totalOrders: 2, totalSpent: 107998, source: 'homepage' },
  { id: 'c3', name: 'Kamal Hossain', phone: '01966666666', email: 'kamal@yahoo.com', shopId: 'shop_1', registeredAt: '2026-05-01', lastActivity: '2026-05-19', totalOrders: 1, totalSpent: 149999, source: 'search' },
  { id: 'c4', name: 'Nasrin Begum', phone: '01933333333', shopId: 'shop_2', registeredAt: '2026-03-15', lastActivity: '2026-05-17', totalOrders: 5, totalSpent: 89990, source: 'homepage' },
  { id: 'c5', name: 'Tariqul Islam', phone: '01744444444', email: 'tariq@gmail.com', shopId: 'shop_2', registeredAt: '2026-04-02', lastActivity: '2026-05-19', totalOrders: 2, totalSpent: 37998, source: 'direct' },
  { id: 'c6', name: 'Sumaiya Begum', phone: '01622222222', shopId: 'shop_2', registeredAt: '2026-04-28', lastActivity: '2026-05-15', totalOrders: 4, totalSpent: 71996, source: 'referral' },
  { id: 'c7', name: 'Monira Khatun', phone: '01855555555', shopId: 'shop_3', registeredAt: '2026-02-20', lastActivity: '2026-05-19', totalOrders: 8, totalSpent: 21200, source: 'homepage' },
  { id: 'c8', name: 'Sumaiya Akter', phone: '01677777777', shopId: 'shop_3', registeredAt: '2026-03-10', lastActivity: '2026-05-19', totalOrders: 3, totalSpent: 7794, source: 'direct' },
]

const INITIAL_CUSTOMER_ORDERS: CustomerOrder[] = [
  { id: 'co1', customerId: 'c1', shopId: 'shop_1', items: [{ productId: 'p1', name: 'Samsung Galaxy S24', qty: 1, price: 89999 }], total: 89999, address: 'House 12, Road 5, Dhanmondi, Dhaka', status: 'delivered', placedAt: '2026-05-10' },
  { id: 'co2', customerId: 'c2', shopId: 'shop_1', items: [{ productId: 'p3', name: 'Sony WH-1000XM5', qty: 1, price: 32999 }, { productId: 'p4', name: 'Smart LED TV 55"', qty: 1, price: 74999 }], total: 107998, address: 'Flat 3B, Gulshan Ave, Dhaka', status: 'pending', placedAt: '2026-05-18' },
  { id: 'co3', customerId: 'c4', shopId: 'shop_2', items: [{ productId: 'p5', name: 'Silk Saree Premium', qty: 2, price: 8999 }], total: 17998, address: 'Block C, Mirpur 10, Dhaka', status: 'delivered', placedAt: '2026-05-17' },
  { id: 'co4', customerId: 'c7', shopId: 'shop_3', items: [{ productId: 'p8', name: 'Organic Rice 5kg', qty: 3, price: 650 }, { productId: 'p9', name: 'Fresh Vegetables Box', qty: 2, price: 350 }], total: 2650, address: 'House 8, Khilgaon, Dhaka', status: 'confirmed', placedAt: '2026-05-19' },
]

interface CustomerStore {
  customers: Customer[]
  customerOrders: CustomerOrder[]
  currentCustomer: Customer | null
  setCustomers: (c: Customer[]) => void
  setCustomerOrders: (o: CustomerOrder[]) => void
  registerCustomer: (data: { name: string; phone: string; email?: string; shopId: string; source?: Customer['source'] }) => Customer
  loginCustomer: (phone: string, shopId: string) => Customer | null
  logoutCustomer: () => void
  placeCustomerOrder: (order: Omit<CustomerOrder, 'id' | 'placedAt' | 'status'>) => CustomerOrder
}

const Ctx = createContext<CustomerStore>({
  customers: [], customerOrders: [], currentCustomer: null,
  setCustomers: () => {}, setCustomerOrders: () => {},
  registerCustomer: () => ({} as Customer),
  loginCustomer: () => null,
  logoutCustomer: () => {},
  placeCustomerOrder: () => ({} as CustomerOrder),
})

export function CustomerStoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS)
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>(INITIAL_CUSTOMER_ORDERS)
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)

  function registerCustomer(data: { name: string; phone: string; email?: string; shopId: string; source?: Customer['source'] }): Customer {
    const existing = customers.find(c => c.phone === data.phone && c.shopId === data.shopId)
    if (existing) { setCurrentCustomer(existing); return existing }
    const newCustomer: Customer = {
      id: 'c_' + Date.now(), name: data.name, phone: data.phone, email: data.email,
      shopId: data.shopId, registeredAt: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0], totalOrders: 0, totalSpent: 0,
      source: data.source ?? 'direct',
    }
    setCustomers(prev => [...prev, newCustomer])
    setCurrentCustomer(newCustomer)
    return newCustomer
  }

  function loginCustomer(phone: string, shopId: string): Customer | null {
    const found = customers.find(c => c.phone === phone && c.shopId === shopId)
    if (found) { setCurrentCustomer(found); return found }
    return null
  }

  function placeCustomerOrder(order: Omit<CustomerOrder, 'id' | 'placedAt' | 'status'>): CustomerOrder {
    const newOrder: CustomerOrder = { ...order, id: 'co_' + Date.now(), placedAt: new Date().toISOString().split('T')[0], status: 'pending' }
    setCustomerOrders(prev => [...prev, newOrder])
    setCustomers(prev => prev.map(c =>
      c.id === order.customerId
        ? { ...c, totalOrders: c.totalOrders + 1, totalSpent: c.totalSpent + order.total, lastActivity: new Date().toISOString().split('T')[0] }
        : c
    ))
    return newOrder
  }

  return (
    <Ctx.Provider value={{ customers, customerOrders, currentCustomer, setCustomers, setCustomerOrders, registerCustomer, loginCustomer: loginCustomer, logoutCustomer: () => setCurrentCustomer(null), placeCustomerOrder }}>
      {children}
    </Ctx.Provider>
  )
}

export const useCustomerStore = () => useContext(Ctx)
