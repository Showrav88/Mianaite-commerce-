import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo, useCallback } from 'react'
import { ArrowLeft, Plus, Trash2, RefreshCw, Save, Package, X } from 'lucide-react'
import { MARKET_PRODUCTS, type MarketProduct, type ProductVariant, fmt } from '@/mock/products'
import { MARKET_CATEGORIES } from '@/mock/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/catalog/products_/$id')({
  component: ProductDetail,
  head: ({ params }) => ({ meta: [{ title: params.id === 'new' ? 'New Product' : 'Edit Product' }] }),
})

// ── Variant Matrix ──────────────────────────────────────────────────────────

interface AttrAxis {
  name: string
  values: string[]
}

function cartesian(axes: AttrAxis[]): Record<string, string>[] {
  if (axes.length === 0) return [{}]
  const [first, ...rest] = axes
  const restProduct = cartesian(rest)
  return first.values.flatMap(v =>
    restProduct.map(combo => ({ [first.name]: v, ...combo }))
  )
}

function generateSku(productName: string, attrs: Record<string, string>, idx: number) {
  const prefix = productName.split(' ').map(w => w[0]).join('').slice(0, 4).toUpperCase()
  const attrPart = Object.values(attrs).map(v => v.slice(0, 3).toUpperCase()).join('-')
  return `1T99-${prefix}-${String(idx + 1).padStart(3, '0')}${attrPart ? '-' + attrPart : ''}`
}

interface MatrixRow {
  id: string
  attributes: Record<string, string>
  sku: string
  price: number
  cost: number
  stock: number
  active: boolean
}

function VariantMatrixBuilder({
  categoryId,
  productName,
  existingVariants,
  onSave,
}: {
  categoryId: string
  productName: string
  existingVariants: ProductVariant[]
  onSave: (variants: ProductVariant[]) => void
}) {
  const cat = MARKET_CATEGORIES.find(c => c.id === categoryId)
  const suggestedAxes: AttrAxis[] = cat?.attributes?.map(a => ({
    name: a.label,
    values: [],
  })) ?? []

  const [axes, setAxes] = useState<AttrAxis[]>(() => {
    if (existingVariants.length > 0) {
      const attrKeys = Object.keys(existingVariants[0].attributes)
      return attrKeys.map(k => ({
        name: k,
        values: [...new Set(existingVariants.map(v => v.attributes[k]).filter(Boolean))],
      }))
    }
    return suggestedAxes.length > 0 ? suggestedAxes : [{ name: 'Color', values: [] }]
  })

  const [newAxisName, setNewAxisName] = useState('')
  const [matrix, setMatrix] = useState<MatrixRow[]>(() =>
    existingVariants.map(v => ({
      id: v.id,
      attributes: v.attributes,
      sku: v.sku,
      price: v.price,
      cost: v.cost,
      stock: v.stock,
      active: v.active,
    }))
  )
  const [generated, setGenerated] = useState(existingVariants.length > 0)
  const [defaultPrice, setDefaultPrice] = useState(existingVariants[0]?.price ?? 0)
  const [defaultCost, setDefaultCost] = useState(existingVariants[0]?.cost ?? 0)
  const [defaultStock, setDefaultStock] = useState(existingVariants[0]?.stock ?? 0)

  const addAxis = useCallback(() => {
    if (!newAxisName.trim()) return
    setAxes(prev => [...prev, { name: newAxisName.trim(), values: [] }])
    setNewAxisName('')
    setGenerated(false)
  }, [newAxisName])

  const removeAxis = useCallback((idx: number) => {
    setAxes(prev => prev.filter((_, i) => i !== idx))
    setGenerated(false)
  }, [])

  const addValue = useCallback((axisIdx: number, val: string) => {
    if (!val.trim()) return
    setAxes(prev => prev.map((a, i) =>
      i === axisIdx && !a.values.includes(val.trim())
        ? { ...a, values: [...a.values, val.trim()] }
        : a
    ))
    setGenerated(false)
  }, [])

  const removeValue = useCallback((axisIdx: number, val: string) => {
    setAxes(prev => prev.map((a, i) =>
      i === axisIdx ? { ...a, values: a.values.filter(v => v !== val) } : a
    ))
    setGenerated(false)
  }, [])

  function generateMatrix() {
    const validAxes = axes.filter(a => a.values.length > 0)
    if (validAxes.length === 0) { toast.error('Add at least one attribute value first'); return }
    const combos = cartesian(validAxes)
    const rows: MatrixRow[] = combos.map((attrs, idx) => {
      const existing = matrix.find(m =>
        JSON.stringify(m.attributes) === JSON.stringify(attrs)
      )
      return existing ?? {
        id: `v_new_${idx}`,
        attributes: attrs,
        sku: generateSku(productName, attrs, idx),
        price: defaultPrice,
        cost: defaultCost,
        stock: defaultStock,
        active: true,
      }
    })
    setMatrix(rows)
    setGenerated(true)
    toast.success(`Generated ${rows.length} variant${rows.length !== 1 ? 's' : ''}`)
  }

  function patchRow(id: string, patch: Partial<MatrixRow>) {
    setMatrix(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  function saveVariants() {
    if (matrix.length === 0) { toast.error('Generate the matrix first'); return }
    onSave(matrix.map(r => ({
      id: r.id,
      sku: r.sku,
      attributes: r.attributes,
      price: r.price,
      cost: r.cost,
      stock: r.stock,
      active: r.active,
    })))
    toast.success('Variants saved!')
  }

  const allAttrKeys = [...new Set(matrix.flatMap(r => Object.keys(r.attributes)))]

  return (
    <div className="space-y-5">
      {/* Axis builder */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Attribute Axes</CardTitle>
          <p className="text-xs text-muted-foreground">Define the dimensions of your variant matrix (e.g. Color × Size)</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {axes.map((axis, ai) => (
            <div key={ai} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-28 shrink-0">{axis.name}</span>
                <AxisValueInput
                  onAdd={val => addValue(ai, val)}
                  placeholder={`Add ${axis.name} value…`}
                />
                <button onClick={() => removeAxis(ai)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-30">
                {axis.values.map(v => (
                  <Badge key={v} variant="secondary" className="gap-1.5 pr-1.5">
                    {v}
                    <button onClick={() => removeValue(ai, v)} className="hover:text-destructive transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {axis.values.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No values yet</p>
                )}
              </div>
            </div>
          ))}

          {/* Add axis */}
          <div className="flex gap-2">
            <Input
              placeholder="New attribute name (e.g. Material)…"
              className="h-8 text-sm"
              value={newAxisName}
              onChange={e => setNewAxisName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAxis()}
            />
            <Button variant="outline" size="sm" className="h-8 gap-1.5 shrink-0" onClick={addAxis}>
              <Plus className="w-3.5 h-3.5" /> Add Axis
            </Button>
          </div>

          {/* Default values */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <Label className="text-xs mb-1 block">Default Price (৳)</Label>
              <Input type="number" value={defaultPrice} onChange={e => setDefaultPrice(Number(e.target.value))} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Default Cost (৳)</Label>
              <Input type="number" value={defaultCost} onChange={e => setDefaultCost(Number(e.target.value))} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Default Stock</Label>
              <Input type="number" value={defaultStock} onChange={e => setDefaultStock(Number(e.target.value))} className="h-8 text-sm" />
            </div>
          </div>

          <Button onClick={generateMatrix} className="gap-2 w-full sm:w-auto">
            <RefreshCw className="w-4 h-4" />
            Generate Matrix
            {axes.filter(a => a.values.length > 0).length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {cartesian(axes.filter(a => a.values.length > 0)).length} combos
              </Badge>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated matrix grid */}
      {generated && matrix.length > 0 && (
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="pb-0 border-b bg-muted/30 flex-row items-center justify-between">
            <CardTitle className="text-sm">{matrix.length} Variant{matrix.length !== 1 ? 's' : ''}</CardTitle>
            <Button size="sm" className="gap-1.5 h-7" onClick={saveVariants}>
              <Save className="w-3.5 h-3.5" /> Save Variants
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  {allAttrKeys.map(k => (
                    <TableHead key={k} className="text-xs font-semibold">{k}</TableHead>
                  ))}
                  <TableHead className="text-xs font-semibold">SKU</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Price ৳</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Cost ৳</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Stock</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrix.map(row => (
                  <TableRow key={row.id} className={!row.active ? 'opacity-50' : ''}>
                    {allAttrKeys.map(k => (
                      <TableCell key={k} className="text-sm">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {row.attributes[k] ?? '—'}
                        </Badge>
                      </TableCell>
                    ))}
                    <TableCell>
                      <Input
                        value={row.sku}
                        onChange={e => patchRow(row.id, { sku: e.target.value })}
                        className="h-7 text-xs font-mono w-44"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.price}
                        onChange={e => patchRow(row.id, { price: Number(e.target.value) })}
                        className="h-7 text-xs text-right w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.cost}
                        onChange={e => patchRow(row.id, { cost: Number(e.target.value) })}
                        className="h-7 text-xs text-right w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.stock}
                        onChange={e => patchRow(row.id, { stock: Number(e.target.value) })}
                        className="h-7 text-xs text-right w-20"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={row.active}
                        onCheckedChange={v => patchRow(row.id, { active: v })}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {!generated && (
        <div className="rounded-xl border-2 border-dashed p-8 text-center">
          <RefreshCw className="w-8 h-8 mx-auto text-muted-foreground/30 mb-3" />
          <p className="font-medium text-muted-foreground text-sm">No matrix generated yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add attribute values above, then click Generate Matrix</p>
        </div>
      )}
    </div>
  )
}

function AxisValueInput({ onAdd, placeholder }: { onAdd: (v: string) => void; placeholder: string }) {
  const [val, setVal] = useState('')
  return (
    <div className="flex gap-1.5 flex-1">
      <Input
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
        onKeyDown={e => { if (e.key === 'Enter') { onAdd(val); setVal('') } }}
      />
      <Button
        variant="outline" size="sm" className="h-8 px-2 shrink-0"
        onClick={() => { onAdd(val); setVal('') }}
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

// ── Main Product Detail Page ────────────────────────────────────────────────

function ProductDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const existing = useMemo(() => isNew ? null : MARKET_PRODUCTS.find(p => p.id === id) ?? null, [id, isNew])

  const [name, setName] = useState(existing?.name ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? MARKET_CATEGORIES[0].id)
  const [status, setStatus] = useState<MarketProduct['status']>(existing?.status ?? 'draft')
  const [variants, setVariants] = useState<ProductVariant[]>(existing?.variants ?? [])
  const [saving, setSaving] = useState(false)

  if (!isNew && !existing) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Package className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="font-medium text-muted-foreground">Product not found</p>
        <Link to="/admin/catalog/products">
          <Button variant="link" size="sm" className="mt-2">← Back to products</Button>
        </Link>
      </div>
    )
  }

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success(isNew ? 'Product created!' : 'Product updated!')
      if (isNew) void navigate({ to: '/admin/catalog/products' })
    }, 600)
  }

  const cat = MARKET_CATEGORIES.find(c => c.id === categoryId)

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/catalog/products">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">
            {isNew ? 'New Product' : (existing?.name ?? 'Edit Product')}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isNew ? 'Fill in the details below' : `ID: ${id}`}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5 shrink-0">
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Product'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="variants">
            Variants
            {variants.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">{variants.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-4">
          <Card className="border shadow-sm">
            <CardContent className="pt-5 space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Product Name</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Casio MQ-24 Classic Watch"
                  className="text-base font-medium"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Description</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the product clearly…"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKET_CATEGORIES.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Status</Label>
                  <Select value={status} onValueChange={v => setStatus(v as MarketProduct['status'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants — the showpiece */}
        <TabsContent value="variants">
          <VariantMatrixBuilder
            categoryId={categoryId}
            productName={name || 'Product'}
            existingVariants={variants}
            onSave={setVariants}
          />
        </TabsContent>

        {/* Images */}
        <TabsContent value="images">
          <Card className="border shadow-sm">
            <CardContent className="pt-5">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                {(existing?.images ?? []).map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border bg-muted relative group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                <button className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <Plus className="w-5 h-5 mb-1" />
                  <span className="text-xs">Add image</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Recommended: 800×800px, JPG/PNG, max 2MB</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory">
          <Card className="border shadow-sm">
            <CardContent className="pt-5">
              {variants.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Stock is managed per-variant in the Variants tab.</p>
                  <div className="divide-y rounded-xl border overflow-hidden">
                    {variants.map(v => (
                      <div key={v.id} className="flex items-center justify-between px-4 py-2.5">
                        <div>
                          <p className="text-sm font-medium">{Object.values(v.attributes).join(' / ') || 'Standard'}</p>
                          <p className="text-xs text-muted-foreground font-mono">{v.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${v.stock === 0 ? 'text-destructive' : v.stock <= 5 ? 'text-amber-600' : 'text-foreground'}`}>
                            {v.stock} in stock
                          </p>
                          <p className="text-xs text-muted-foreground">{fmt(v.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">Set up variants first to manage inventory.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card className="border shadow-sm">
            <CardContent className="pt-5 space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">SEO Title</Label>
                <Input defaultValue={existing?.name} placeholder="SEO title…" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Meta Description</Label>
                <Textarea defaultValue={existing?.description?.slice(0, 160)} rows={3} placeholder="155–160 characters…" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground shrink-0">/product/</span>
                  <Input defaultValue={existing?.slug} placeholder="url-slug-here" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
