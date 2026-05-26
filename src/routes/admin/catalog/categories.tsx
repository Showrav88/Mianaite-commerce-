import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronRight, ChevronDown, Plus, Pencil, Layers, Tag } from 'lucide-react'
import { MARKET_CATEGORIES, type MarketCategory } from '@/mock/categories'
import { MARKET_PRODUCTS, getTotalStock } from '@/mock/products'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/catalog/categories')({
  component: CategoriesTree,
  head: () => ({ meta: [{ title: 'Categories — 1to99 Market Admin' }] }),
})

function AttrPill({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs font-medium text-foreground">{label}:</span>
      {values.slice(0, 4).map(v => (
        <Badge key={v} variant="secondary" className="text-[10px] py-0">{v}</Badge>
      ))}
      {values.length > 4 && (
        <Badge variant="outline" className="text-[10px] py-0">+{values.length - 4} more</Badge>
      )}
    </div>
  )
}

function CategoryRow({ cat, isOpen, onToggle }: {
  cat: MarketCategory
  isOpen: boolean
  onToggle: () => void
}) {
  const [showEdit, setShowEdit] = useState(false)
  const [catName, setCatName] = useState(cat.name)
  const productCount = MARKET_PRODUCTS.filter(p => p.categoryId === cat.id).length
  const totalStock = MARKET_PRODUCTS
    .filter(p => p.categoryId === cat.id)
    .reduce((s, p) => s + getTotalStock(p), 0)

  return (
    <>
      <div
        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer border-b transition-colors group"
        onClick={onToggle}
      >
        <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <span className="text-2xl w-8 text-center shrink-0">{cat.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground">{cat.name}</span>
            {cat.attributes && cat.attributes.length > 0 && (
              <Badge variant="outline" className="text-[10px] py-0 gap-0.5">
                <Tag className="w-2.5 h-2.5" /> {cat.attributes.length} attrs
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">/{cat.slug}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-right">
          <div>
            <p className="text-sm font-semibold text-foreground">{productCount}</p>
            <p className="text-[10px] text-muted-foreground">products</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{totalStock}</p>
            <p className="text-[10px] text-muted-foreground">in stock</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setShowEdit(true) }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-muted"
          >
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Subcategories + attributes */}
      {isOpen && (
        <div className="bg-muted/20 border-b">
          <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x">
            {/* Subcategories */}
            <div className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Subcategories ({cat.subcategories.length})
              </p>
              <div className="space-y-1">
                {cat.subcategories.map(sub => {
                  const subCount = MARKET_PRODUCTS.filter(p => p.subcategoryId === sub.id).length
                  return (
                    <div key={sub.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-background transition-colors group/sub">
                      <div>
                        <span className="text-sm text-foreground">{sub.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono ml-2">/{sub.slug}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {subCount > 0 && (
                          <Badge variant="secondary" className="text-[10px] py-0">{subCount}</Badge>
                        )}
                        <button className="opacity-0 group-hover/sub:opacity-100 transition-opacity">
                          <Pencil className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  )
                })}
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-2 px-2 py-1">
                  <Plus className="w-3 h-3" /> Add subcategory
                </button>
              </div>
            </div>

            {/* Attributes */}
            <div className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Variant Attributes {cat.attributes ? `(${cat.attributes.length})` : '(none)'}
              </p>
              {cat.attributes && cat.attributes.length > 0 ? (
                <div className="space-y-3">
                  {cat.attributes.map(attr => (
                    <div key={attr.key} className="rounded-lg border bg-background p-3">
                      <p className="text-sm font-medium text-foreground mb-1.5">{attr.label}</p>
                      {attr.options && (
                        <AttrPill label="" values={attr.options.map(o => o.label)} />
                      )}
                      <p className="text-[10px] text-muted-foreground font-mono mt-1.5">key: {attr.key}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No variant attributes defined for this category.</p>
              )}
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-3">
                <Plus className="w-3 h-3" /> Add attribute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit dialog (stub) */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Category — {cat.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input value={catName} onChange={e => setCatName(e.target.value)} />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setShowEdit(false)
                toast.success('Category updated (demo — not persisted)')
              }}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CategoriesTree() {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['cat_watches', 'cat_kitchen']))

  function toggle(id: string) {
    setOpenIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const totalProducts = MARKET_PRODUCTS.length
  const activeProducts = MARKET_PRODUCTS.filter(p => p.status === 'active').length

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{MARKET_CATEGORIES.length} categories · {totalProducts} products · {activeProducts} active</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => toast.info('Add category — coming soon')}>
          <Plus className="w-3.5 h-3.5" /> New Category
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MARKET_CATEGORIES.slice(0, 4).map(cat => {
          const count = MARKET_PRODUCTS.filter(p => p.categoryId === cat.id).length
          return (
            <Card key={cat.id} className="border shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => toggle(cat.id)}>
              <CardContent className="pt-4 pb-3">
                <span className="text-2xl">{cat.icon}</span>
                <p className="text-sm font-medium text-foreground mt-1.5">{cat.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{count} products</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tree */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="pb-0 border-b bg-muted/30">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" /> Category Tree
          </CardTitle>
        </CardHeader>
        <div>
          {MARKET_CATEGORIES.map(cat => (
            <CategoryRow
              key={cat.id}
              cat={cat}
              isOpen={openIds.has(cat.id)}
              onToggle={() => toggle(cat.id)}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
