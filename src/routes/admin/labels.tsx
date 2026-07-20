import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Printer, Download, Search, Check, Package } from 'lucide-react'
import { MARKET_PRODUCTS, fmt, getMinPrice } from '@/mock/products'
import { MARKET_CATEGORIES } from '@/mock/categories'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/labels')({
  component: LabelsPage,
  head: () => ({ meta: [{ title: 'Label Builder — 1to99 Market Admin' }] }),
})

interface LabelTemplate {
  id: string
  name: string
  namebn: string
  size: string
  description: string
  descriptionbn: string
  widthMm: number
  heightMm: number
  cols: number
  rows: number
}

const TEMPLATES: LabelTemplate[] = [
  { id: 'tiny', name: 'Tiny Tag', namebn: 'ছোট ট্যাগ', size: '25×15mm', description: 'Jewellery, small accessories', descriptionbn: 'গহনা, ছোট আনুষাঙ্গিক', widthMm: 25, heightMm: 15, cols: 8, rows: 20 },
  { id: 'standard', name: 'Standard', namebn: 'স্ট্যান্ডার্ড', size: '50×30mm', description: 'Most products — default choice', descriptionbn: 'বেশিরভাগ পণ্য — ডিফল্ট', widthMm: 50, heightMm: 30, cols: 4, rows: 9 },
  { id: 'hang', name: 'Hang Tag', namebn: 'হ্যাং ট্যাগ', size: '40×60mm', description: 'Garments, shoes, bags', descriptionbn: 'পোশাক, জুতা, ব্যাগ', widthMm: 40, heightMm: 60, cols: 3, rows: 5 },
  { id: 'shelf', name: 'Shelf Label', namebn: 'শেলফ লেবেল', size: '80×40mm', description: 'Shelf edge, display pricing', descriptionbn: 'শেলফ প্রান্ত, মূল্য প্রদর্শন', widthMm: 80, heightMm: 40, cols: 2, rows: 7 },
  { id: 'large', name: 'Large', namebn: 'বড়', size: '100×70mm', description: 'Electronics, appliances', descriptionbn: 'ইলেকট্রনিক্স, যন্ত্রপাতি', widthMm: 100, heightMm: 70, cols: 2, rows: 4 },
  { id: 'wedding', name: 'Wedding Gift Tag', namebn: 'বিবাহ উপহার ট্যাগ', size: '60×90mm', description: 'Premium gift tags', descriptionbn: 'প্রিমিয়াম গিফট ট্যাগ', widthMm: 60, heightMm: 90, cols: 2, rows: 3 },
]

function TemplateSvgPreview({ tpl }: { tpl: LabelTemplate }) {
  const scale = Math.min(80 / tpl.widthMm, 60 / tpl.heightMm)
  const w = tpl.widthMm * scale
  const h = tpl.heightMm * scale
  return (
    <svg width={w} height={h} viewBox={`0 0 ${tpl.widthMm} ${tpl.heightMm}`} className="mx-auto">
      <rect width={tpl.widthMm} height={tpl.heightMm} rx="2" fill="white" stroke="#e2e8f0" strokeWidth="0.5" />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={4 + i * (tpl.widthMm > 40 ? 2.2 : 1.4)} y={tpl.heightMm * 0.55} width={tpl.widthMm > 40 ? 1.2 : 0.8} height={tpl.heightMm * 0.25} fill="#1e293b" />
      ))}
      <rect x={3} y={3} width={tpl.widthMm * 0.65} height={tpl.widthMm > 40 ? 3.5 : 2.5} rx="0.5" fill="#e2e8f0" />
      <rect x={3} y={tpl.heightMm * 0.28} width={tpl.widthMm * 0.4} height={tpl.widthMm > 40 ? 4 : 2.5} rx="0.5" fill="#f97316" opacity="0.8" />
    </svg>
  )
}

function LabelSvg({
  product,
  template,
  variant,
}: {
  product: typeof MARKET_PRODUCTS[0]
  template: LabelTemplate
  variant: typeof MARKET_PRODUCTS[0]['variants'][0]
}) {
  const W = template.widthMm
  const H = template.heightMm
  const price = variant.price
  const shopCode = '1T99-DHK-MRP-001'
  const attrLabel = Object.values(variant.attributes).join(' / ') || 'Standard'

  return (
    <svg width={W * 3.78} height={H * 3.78} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} rx="1.5" fill="white" stroke="#e2e8f0" strokeWidth="0.4" />
      <rect width={W} height={H * 0.22} rx="1.5" fill="#f97316" />
      <text x={W / 2} y={H * 0.145} textAnchor="middle" fontSize={W > 50 ? "3.2" : "2.4"} fontFamily="Inter,sans-serif" fontWeight="700" fill="white">
        1to99 Market
      </text>
      <text x={3} y={H * 0.36} fontSize={W > 50 ? "3.5" : "2.4"} fontFamily="Inter,sans-serif" fontWeight="600" fill="#1e293b">
        {product.name.length > 22 ? product.name.slice(0, 22) + '…' : product.name}
      </text>
      {attrLabel !== 'Standard' && (
        <text x={3} y={H * 0.48} fontSize="2.2" fontFamily="Inter,sans-serif" fill="#64748b">
          {attrLabel.length > 24 ? attrLabel.slice(0, 24) + '…' : attrLabel}
        </text>
      )}
      <text x={3} y={H * 0.60} fontSize="1.9" fontFamily="monospace" fill="#94a3b8">{variant.sku}</text>
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={3 + i * (W > 50 ? 2.5 : 1.8)} y={H * 0.65} width={W > 50 ? 1.4 : 1} height={H * 0.2} fill="#1e293b" />
      ))}
      <text x={W - 3} y={H * 0.93} textAnchor="end" fontSize={W > 50 ? "5" : "4"} fontFamily="Inter,sans-serif" fontWeight="800" fill="#1e293b">
        ৳{price.toLocaleString('en-BD')}
      </text>
      <text x={3} y={H * 0.94} fontSize="1.6" fontFamily="monospace" fill="#94a3b8">{shopCode}</text>
    </svg>
  )
}

function SheetPreview({
  products,
  template,
}: {
  products: typeof MARKET_PRODUCTS
  template: LabelTemplate
}) {
  const PAGE_W = 210
  const PAGE_H = 297
  const MARGIN = 10
  const GAP_H = 3
  const GAP_V = 3
  const usableW = PAGE_W - MARGIN * 2
  const usableH = PAGE_H - MARGIN * 2
  const cols = template.cols
  const rows = template.rows
  const cellW = (usableW - (cols - 1) * GAP_H) / cols
  const cellH = (usableH - (rows - 1) * GAP_V) / rows

  const slots = Array.from({ length: cols * rows })
  let labelIdx = 0
  const allVariants: { product: typeof MARKET_PRODUCTS[0]; variant: typeof MARKET_PRODUCTS[0]['variants'][0] }[] = []
  for (const p of products) {
    for (const v of p.variants) {
      allVariants.push({ product: p, variant: v })
    }
  }

  const { t, tx } = useI18n()

  return (
    <div className="overflow-auto max-h-full">
      <svg
        width="100%"
        viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
        style={{ border: '1px solid #e2e8f0', background: 'white', maxWidth: 420 }}
      >
        <rect width={PAGE_W} height={PAGE_H} fill="white" />
        {slots.map((_, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const x = MARGIN + col * (cellW + GAP_H)
          const y = MARGIN + row * (cellH + GAP_V)
          const entry = allVariants[labelIdx]
          if (entry) labelIdx++

          return (
            <g key={i} transform={`translate(${x},${y})`}>
              {entry ? (
                <LabelSvg product={entry.product} template={{ ...template, widthMm: cellW, heightMm: cellH }} variant={entry.variant} />
              ) : (
                <rect width={cellW} height={cellH} rx="1" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.3" strokeDasharray="1.5,1.5" />
              )}
            </g>
          )
        })}
      </svg>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        {t('labels.sheetCaption', { cols: String(cols), rows: String(rows), n: String(cols * rows), sheets: String(Math.ceil(allVariants.length / (cols * rows))) })}
      </p>
    </div>
  )
}

function LabelsPage() {
  const { t, lang, tx } = useI18n()
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate>(TEMPLATES[1])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return MARKET_PRODUCTS.filter(p =>
      !q || p.name.toLowerCase().includes(q) || p.variants.some(v => v.sku.toLowerCase().includes(q))
    )
  }, [query])

  const selectedProducts = useMemo(() =>
    MARKET_PRODUCTS.filter(p => selected.has(p.id))
  , [selected])

  function toggleProduct(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handlePrint() {
    if (selected.size === 0) { toast.error(t('labels.selectProductFirst')); return }
    const n = String(selectedProducts.reduce((s, p) => s + p.variants.length, 0))
    toast.success(t('labels.sendingToPrinter', { n }))
  }
  function handleDownload() {
    if (selected.size === 0) { toast.error(t('labels.selectProductFirst')); return }
    toast.success(t('labels.pdfStarted'))
  }

  const totalLabels = selectedProducts.reduce((s, p) => s + p.variants.length, 0)

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left — templates */}
      <aside className="w-56 border-r bg-muted/20 flex flex-col overflow-y-auto shrink-0">
        <div className="p-3 border-b">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('labels.templates')}</p>
        </div>
        <div className="p-2 space-y-1.5">
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl)}
              className={`w-full rounded-xl p-3 text-left transition-all border-2 ${
                selectedTemplate.id === tpl.id
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:border-border hover:bg-background'
              }`}
            >
              <TemplateSvgPreview tpl={tpl} />
              <p className="text-xs font-semibold text-foreground mt-2 text-center">{lang === 'bn' ? tpl.namebn : tpl.name}</p>
              <p className="text-[10px] text-muted-foreground text-center">{tpl.size}</p>
              <p className="text-[10px] text-muted-foreground text-center leading-tight mt-0.5">{lang === 'bn' ? tpl.descriptionbn : tpl.description}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* Middle — product picker */}
      <div className="w-72 border-r flex flex-col overflow-hidden shrink-0">
        <div className="p-3 border-b space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('labels.products')}</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder={t('labels.searchPlaceholder')}
              className="pl-8 h-8 text-sm"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          {selected.size > 0 && (
            <p className="text-xs text-primary font-medium">{t('labels.selectedCount', { n: String(selected.size) })}</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto divide-y">
          {filtered.map(p => {
            const isSelected = selected.has(p.id)
            const cat = MARKET_CATEGORIES.find(c => c.id === p.categoryId)
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                onClick={() => toggleProduct(p.id)}
              >
                <Checkbox checked={isSelected} onCheckedChange={() => toggleProduct(p.id)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {cat?.icon} {p.variants.length} {t('labels.variants')} · {fmt(getMinPrice(p))}
                  </p>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right — sheet preview */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-900">
        <div className="p-3 border-b bg-background flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {lang === 'bn' ? selectedTemplate.namebn : selectedTemplate.name} — {selectedTemplate.size}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedProducts.length === 0
                ? t('labels.selectHint')
                : `${t('labels.labelCount', { n: String(totalLabels) })} · ${t('labels.selectedCount', { n: String(selectedProducts.length) })}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={handleDownload} disabled={selected.size === 0}>
              <Download className="w-3.5 h-3.5" /> {t('labels.pdf')}
            </Button>
            <Button size="sm" className="gap-1.5 h-8" onClick={handlePrint} disabled={selected.size === 0}>
              <Printer className="w-3.5 h-3.5" /> {t('labels.print')}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
          {selectedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium text-muted-foreground text-sm">{t('labels.noProducts')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('labels.noProductsDesc')}</p>
            </div>
          ) : (
            <SheetPreview products={selectedProducts} template={selectedTemplate} />
          )}
        </div>
      </div>
    </div>
  )
}
