import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { Printer, Download, Search, Check, Package, Settings2, QrCode, Barcode } from 'lucide-react'
import { useAdminStore, fmt, effectivePrice, type AdminProduct, type Category } from '@/lib/admin-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import {
  loadLabelFields,
  saveLabelFields,
  loadLabelStyle,
  saveLabelStyle,
  type LabelFieldConfig,
  type LabelFieldKey,
  type LabelStyleConfig,
} from '@/lib/label-fields'
import { renderLabelSvgContent, openLabelsPrintWindow, type LabelEntry } from '@/lib/label-render'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

const labelsSearchSchema = z.object({
  pick: z.string().optional(),
})

export const Route = createFileRoute('/admin/labels')({
  validateSearch: labelsSearchSchema,
  component: LabelsPage,
  head: () => ({ meta: [{ title: 'Label Builder — 1to99' }] }),
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
  { id: 'standard', name: 'Standard', namebn: 'স্ট্যান্ডার্ড', size: '50×30mm', description: 'Most products — default', descriptionbn: 'বেশিরভাগ পণ্য', widthMm: 50, heightMm: 30, cols: 4, rows: 9 },
  { id: 'hang', name: 'Hang Tag', namebn: 'হ্যাং ট্যাগ', size: '40×60mm', description: 'Garments, shoes', descriptionbn: 'পোশাক, জুতা', widthMm: 40, heightMm: 60, cols: 3, rows: 5 },
  { id: 'shelf', name: 'Shelf Label', namebn: 'শেলফ লেবেল', size: '80×40mm', description: 'Shelf edge pricing', descriptionbn: 'শেলফ মূল্য', widthMm: 80, heightMm: 40, cols: 2, rows: 7 },
  { id: 'large', name: 'Large', namebn: 'বড়', size: '100×70mm', description: 'Electronics', descriptionbn: 'ইলেকট্রনিক্স', widthMm: 100, heightMm: 70, cols: 2, rows: 4 },
]

function productToLabelEntry(p: AdminProduct, shopName: string, categories: Category[]): LabelEntry {
  const cat = categories.find(c => c.id === p.categoryId)
  const sizeLine = p.tags?.[0] ?? cat?.name ?? ''
  return {
    productId: p.id,
    name: p.name,
    sku: p.sku,
    price: effectivePrice(p),
    sizeLine,
    shopName,
    shopCode: '1T99',
  }
}

function LabelCell({
  entry,
  template,
  fields,
  style,
}: {
  entry: LabelEntry
  template: LabelTemplate
  fields: LabelFieldConfig
  style: LabelStyleConfig
}) {
  const W = template.widthMm
  const H = template.heightMm
  const inner = useMemo(
    () => renderLabelSvgContent(entry, W, H, fields, style),
    [entry, W, H, fields, style],
  )
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      className="block max-w-full max-h-full"
      role="img"
      aria-label={entry.name}
    >
      <g dangerouslySetInnerHTML={{ __html: inner }} />
    </svg>
  )
}

function SheetPreview({
  entries,
  template,
  fields,
  style,
}: {
  entries: LabelEntry[]
  template: LabelTemplate
  fields: LabelFieldConfig
  style: LabelStyleConfig
}) {
  const PAGE_W = 210
  const PAGE_H = 297
  const MARGIN = 10
  const GAP_H = 3
  const GAP_V = 3
  const cols = template.cols
  const rows = template.rows
  const usableW = PAGE_W - MARGIN * 2
  const usableH = PAGE_H - MARGIN * 2
  const cellW = (usableW - (cols - 1) * GAP_H) / cols
  const cellH = (usableH - (rows - 1) * GAP_V) / rows
  const scale = Math.min(cellW / template.widthMm, cellH / template.heightMm)
  const labelW = template.widthMm * scale
  const labelH = template.heightMm * scale

  const slots = cols * rows
  const { t } = useI18n()

  return (
    <div className="overflow-auto max-h-full">
      <svg
        width="100%"
        viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
        style={{ border: '1px solid #e2e8f0', background: 'white', maxWidth: 440 }}
      >
        <rect width={PAGE_W} height={PAGE_H} fill="white" />
        {Array.from({ length: slots }).map((_, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const x = MARGIN + col * (cellW + GAP_H) + (cellW - labelW) / 2
          const y = MARGIN + row * (cellH + GAP_V) + (cellH - labelH) / 2
          const entry = entries[i]
          return (
            <foreignObject
              key={i}
              x={x}
              y={y}
              width={labelW}
              height={labelH}
            >
              <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%' }}>
                {entry ? (
                  <LabelCell entry={entry} template={template} fields={fields} style={style} />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      border: '1px dashed #e2e8f0',
                      borderRadius: 4,
                      background: '#f8fafc',
                    }}
                  />
                )}
              </div>
            </foreignObject>
          )
        })}
      </svg>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        {t('labels.sheetCaption', {
          cols: String(cols),
          rows: String(rows),
          n: String(slots),
          sheets: String(Math.ceil(entries.length / slots) || 1),
        })}
      </p>
    </div>
  )
}

const FIELD_META: { key: LabelFieldKey; en: string; bn: string }[] = [
  { key: 'shopName', en: 'Shop name', bn: 'দোকানের নাম' },
  { key: 'productName', en: 'Product name', bn: 'পণ্যের নাম' },
  { key: 'sizeLine', en: 'Size / category', bn: 'সাইজ / ক্যাটাগরি' },
  { key: 'sku', en: 'SKU (under barcode)', bn: 'SKU' },
  { key: 'price', en: 'Price', bn: 'মূল্য' },
  { key: 'barcode', en: 'Barcode (Code 39)', bn: 'বারকোড' },
  { key: 'qrCode', en: 'QR code (SKU scan)', bn: 'QR কোড' },
  { key: 'shopCode', en: 'Shop code', bn: 'শপ কোড' },
]

function LabelsPage() {
  const { user } = useAuth()
  const { pick } = Route.useSearch()
  const { products, shops, allCategories } = useAdminStore()
  const { t, lang, tx } = useI18n()

  const shop = shops.find(s => s.id === user?.shopId)
  const shopName = shop?.name ?? '1to99'
  const primaryDefault = shop?.theme.primaryColor ?? '#f97316'

  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate>(TEMPLATES[1])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [fields, setFields] = useState<LabelFieldConfig>(() => loadLabelFields())
  const [style, setStyle] = useState<LabelStyleConfig>(() => ({
    ...loadLabelStyle(),
    primaryColor: loadLabelStyle().primaryColor || primaryDefault,
  }))

  useEffect(() => { saveLabelFields(fields) }, [fields])
  useEffect(() => { saveLabelStyle(style) }, [style])

  const myProducts = useMemo(
    () => products.filter(p => p.shopId === user?.shopId && p.status === 'active'),
    [products, user?.shopId],
  )

  useEffect(() => {
    if (!pick) return
    const exists = myProducts.some(p => p.id === pick)
    if (exists) setSelected(new Set([pick]))
  }, [pick, myProducts])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return myProducts.filter(p =>
      !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    )
  }, [myProducts, query])

  const selectedEntries = useMemo(() => {
    const list: LabelEntry[] = []
    for (const p of myProducts) {
      if (!selected.has(p.id)) continue
      const entry = productToLabelEntry(p, shopName, allCategories)
      for (let i = 0; i < Math.max(1, style.copiesPerProduct); i++) list.push(entry)
    }
    return list
  }, [myProducts, selected, shopName, style.copiesPerProduct])

  const previewEntries = selectedEntries.slice(0, selectedTemplate.cols * selectedTemplate.rows)

  function toggleProduct(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const setField = useCallback((key: LabelFieldKey, on: boolean) => {
    setFields(prev => ({ ...prev, [key]: on }))
  }, [])

  function handlePrint() {
    if (selected.size === 0) {
      toast.error(t('labels.selectProductFirst'))
      return
    }
    openLabelsPrintWindow(selectedEntries, selectedTemplate, fields, style)
    toast.success(t('labels.printStarted'))
  }

  function handleDownload() {
    handlePrint()
    toast.message(tx('Use “Save as PDF” in the print dialog.', 'প্রিন্ট ডায়ালগে “Save as PDF” বেছে নিন।'))
  }

  const sampleEntry = previewEntries[0] ?? (myProducts[0]
    ? productToLabelEntry(myProducts[0], shopName, allCategories)
    : null)

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <aside className="w-52 border-r bg-muted/20 flex flex-col overflow-y-auto shrink-0 hidden lg:flex">
        <div className="p-3 border-b">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('labels.templates')}</p>
        </div>
        <div className="p-2 space-y-1.5">
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedTemplate(tpl)}
              className={`w-full rounded-xl p-2.5 text-left transition-all border-2 ${
                selectedTemplate.id === tpl.id
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:border-border hover:bg-background'
              }`}
            >
              <p className="text-xs font-semibold text-center">{lang === 'bn' ? tpl.namebn : tpl.name}</p>
              <p className="text-[10px] text-muted-foreground text-center">{tpl.size}</p>
            </button>
          ))}
        </div>
      </aside>

      <div className="w-80 border-r flex flex-col overflow-hidden shrink-0">
        <div className="p-3 border-b bg-slate-50/80 space-y-3 max-h-[45%] overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5" />
            {tx('Tag content', 'ট্যাগে যা থাকবে')}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {FIELD_META.map(f => (
              <label key={f.key} className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox
                  checked={fields[f.key]}
                  onCheckedChange={v => setField(f.key, v === true)}
                />
                <span>{lang === 'bn' ? f.bn : f.en}</span>
                {f.key === 'barcode' && <Barcode className="w-3 h-3 text-muted-foreground ml-auto" />}
                {f.key === 'qrCode' && <QrCode className="w-3 h-3 text-muted-foreground ml-auto" />}
              </label>
            ))}
          </div>
          <div className="space-y-2 pt-1 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{tx('Colored header band', 'রঙিন হেডার')}</Label>
              <Switch
                checked={style.headerBand}
                onCheckedChange={v => setStyle(s => ({ ...s, headerBand: v }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">{tx('Accent', 'রঙ')}</Label>
              <Input
                type="color"
                className="h-8 w-14 p-1 cursor-pointer"
                value={style.primaryColor}
                onChange={e => setStyle(s => ({ ...s, primaryColor: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">{tx('Copies each', 'কপি')}</Label>
              <Input
                type="number"
                min={1}
                max={99}
                className="h-8"
                value={style.copiesPerProduct}
                onChange={e => setStyle(s => ({ ...s, copiesPerProduct: Math.max(1, Number(e.target.value) || 1) }))}
              />
            </div>
          </div>
          {sampleEntry && (
            <div className="rounded-lg border bg-white p-2">
              <p className="text-[10px] text-muted-foreground mb-1 text-center">{tx('Single tag preview', 'একটি ট্যাগ')}</p>
              <div className="mx-auto" style={{ maxWidth: 200, aspectRatio: `${selectedTemplate.widthMm}/${selectedTemplate.heightMm}` }}>
                <LabelCell entry={sampleEntry} template={selectedTemplate} fields={fields} style={style} />
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-b space-y-2 flex-1 flex flex-col min-h-0">
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
          <select
            className="lg:hidden w-full h-8 text-xs border rounded-md px-2 bg-background"
            value={selectedTemplate.id}
            onChange={e => setSelectedTemplate(TEMPLATES.find(tpl => tpl.id === e.target.value) ?? TEMPLATES[1])}
          >
            {TEMPLATES.map(tpl => (
              <option key={tpl.id} value={tpl.id}>{lang === 'bn' ? tpl.namebn : tpl.name} ({tpl.size})</option>
            ))}
          </select>
          {selected.size > 0 && (
            <p className="text-xs text-primary font-medium">{t('labels.selectedCount', { n: String(selected.size) })}</p>
          )}
          <div className="flex-1 overflow-y-auto divide-y border rounded-lg min-h-0">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center">{tx('No active products.', 'কোনো সক্রিয় পণ্য নেই।')}</p>
            ) : filtered.map(p => {
              const isSelected = selected.has(p.id)
              const cat = allCategories.find(c => c.id === p.categoryId)
              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                  onClick={() => toggleProduct(p.id)}
                  onKeyDown={e => e.key === 'Enter' && toggleProduct(p.id)}
                >
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleProduct(p.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      {p.sku} · {cat?.icon} {fmt(effectivePrice(p))}
                    </p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
        <div className="p-3 border-b bg-background flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className="text-sm font-semibold">
              {lang === 'bn' ? selectedTemplate.namebn : selectedTemplate.name} — {selectedTemplate.size}
            </p>
            <p className="text-xs text-muted-foreground">
              {selected.size === 0
                ? t('labels.selectHint')
                : `${t('labels.labelCount', { n: String(selectedEntries.length) })} · ${t('labels.selectedCount', { n: String(selected.size) })}`}
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
          {selected.size === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium text-muted-foreground text-sm">{t('labels.noProducts')}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">{t('labels.noProductsDesc')}</p>
            </div>
          ) : (
            <SheetPreview
              entries={previewEntries}
              template={selectedTemplate}
              fields={fields}
              style={style}
            />
          )}
        </div>
      </div>
    </div>
  )
}
