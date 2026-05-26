import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { z } from 'zod'
import { Plus, Search, Filter, Tag, Printer, Package } from 'lucide-react'
import { MARKET_PRODUCTS, getMinPrice, getMaxPrice, getTotalStock, fmt } from '@/mock/products'
import { MARKET_CATEGORIES } from '@/mock/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

const searchSchema = z.object({
  cat: z.string().optional(),
  q: z.string().optional(),
  status: z.enum(['all', 'active', 'draft', 'archived']).optional(),
})

export const Route = createFileRoute('/admin/catalog/products')({
  validateSearch: searchSchema,
  component: ProductsTable,
  head: () => ({ meta: [{ title: 'Products — 1to99 Market Admin' }] }),
})

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  archived: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
}

function ProductsTable() {
  const { cat, q, status } = Route.useSearch()
  const navigate = useNavigate({ from: '/admin/catalog/products' })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading] = useState(false)

  const filtered = useMemo(() => {
    return MARKET_PRODUCTS.filter(p => {
      if (cat && p.categoryId !== cat) return false
      if (status && status !== 'all' && p.status !== status) return false
      if (q) {
        const lq = q.toLowerCase()
        if (!p.name.toLowerCase().includes(lq) && !p.slug.includes(lq) &&
          !p.variants.some(v => v.sku.toLowerCase().includes(lq))) return false
      }
      return true
    })
  }, [cat, q, status])

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function toggleAll() {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id)))
  }

  function bulkLabel() {
    if (selected.size === 0) return
    toast.success(`${selected.size} product(s) sent to label builder`)
    navigate({ to: '/admin/labels' })
  }

  const categoryName = (id: string) => MARKET_CATEGORIES.find(c => c.id === id)?.name ?? id
  const categoryIcon = (id: string) => MARKET_CATEGORIES.find(c => c.id === id)?.icon ?? '📦'

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{MARKET_PRODUCTS.length} products across {MARKET_CATEGORIES.length} categories</p>
        </div>
        <Link to="/admin/catalog/products/$id" params={{ id: 'new' }}>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, SKU…"
            className="pl-9 h-9 text-sm"
            value={q ?? ''}
            onChange={e => navigate({ search: prev => ({ ...prev, q: e.target.value || undefined }) })}
          />
        </div>
        <Select
          value={cat ?? 'all'}
          onValueChange={v => navigate({ search: prev => ({ ...prev, cat: v === 'all' ? undefined : v }) })}
        >
          <SelectTrigger className="h-9 text-sm w-44">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {MARKET_CATEGORIES.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status ?? 'all'}
          onValueChange={v => navigate({ search: prev => ({ ...prev, status: v as any }) })}
        >
          <SelectTrigger className="h-9 text-sm w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={bulkLabel}>
              <Printer className="w-3.5 h-3.5" /> Print Labels
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8">
              <Tag className="w-3.5 h-3.5" /> Edit Price
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-10">
                <Checkbox
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="min-w-[240px]">Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Variants</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <Package className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium text-muted-foreground">No products found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {q || cat ? 'Try different filters' : 'Add your first product'}
                  </p>
                  {!q && !cat && (
                    <Link to="/admin/catalog/products/$id" params={{ id: 'new' }}>
                      <Button size="sm" className="mt-4 gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> New Product
                      </Button>
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            )}
            {!loading && filtered.map(p => {
              const stock = getTotalStock(p)
              const isLow = stock > 0 && stock <= 5
              const isOut = stock === 0
              return (
                <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <Checkbox
                      checked={selected.has(p.id)}
                      onCheckedChange={() => toggleSelect(p.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
                        {categoryIcon(p.categoryId)}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to="/admin/catalog/products/$id"
                          params={{ id: p.id }}
                          className="font-medium text-sm text-foreground hover:text-primary truncate block"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-muted-foreground font-mono truncate">{p.variants[0]?.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{categoryIcon(p.categoryId)} {categoryName(p.categoryId)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="text-xs">{p.variants.length}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`text-sm font-medium ${isOut ? 'text-destructive' : isLow ? 'text-amber-600' : 'text-foreground'}`}>
                      {stock}
                      {isLow && !isOut && <span className="text-xs ml-1 text-amber-500">low</span>}
                      {isOut && <span className="text-xs ml-1 text-destructive">out</span>}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-medium text-foreground">
                      {p.variants.length === 1
                        ? fmt(p.variants[0].price)
                        : `${fmt(getMinPrice(p))}–${fmt(getMaxPrice(p))}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[p.status] ?? ''}`}>
                      {p.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link to="/admin/catalog/products/$id" params={{ id: p.id }}>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Edit</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground text-right">
        Showing {filtered.length} of {MARKET_PRODUCTS.length} products
      </p>
    </div>
  )
}
