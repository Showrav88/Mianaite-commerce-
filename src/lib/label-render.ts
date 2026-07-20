import { barcodeSvgGroup } from '@/lib/barcode-svg'
import { labelQrPayload, qrImageUrl, type LabelFieldConfig, type LabelStyleConfig } from '@/lib/label-fields'

export interface LabelEntry {
  productId: string
  name: string
  sku: string
  price: number
  sizeLine: string
  shopName: string
  shopCode: string
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

function trunc(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

function fmtPrice(n: number): string {
  return `৳${n.toLocaleString('en-BD')}`
}

export function renderLabelSvgContent(
  entry: LabelEntry,
  W: number,
  H: number,
  fields: LabelFieldConfig,
  style: LabelStyleConfig,
): string {
  const parts: string[] = []
  const pad = 1.2
  let y = pad
  const fs = (base: number) => Math.max(1.8, Math.min(base, W * 0.08))

  parts.push(`<rect width="${W}" height="${H}" rx="1" fill="#fff" stroke="#cbd5e1" stroke-width="0.35"/>`)

  if (fields.shopName && style.headerBand) {
    parts.push(`<rect width="${W}" height="${H * 0.2}" rx="1" fill="${style.primaryColor}"/>`)
    parts.push(
      `<text x="${W / 2}" y="${H * 0.13}" text-anchor="middle" font-size="${fs(3.2)}" font-family="system-ui,sans-serif" font-weight="700" fill="#fff">${esc(trunc(entry.shopName, 18))}</text>`,
    )
    y = H * 0.24
  } else if (fields.shopName) {
    parts.push(
      `<text x="${pad}" y="${y + 2.5}" font-size="${fs(2.6)}" font-family="system-ui,sans-serif" font-weight="700" fill="${style.primaryColor}">${esc(trunc(entry.shopName, 20))}</text>`,
    )
    y += 3.5
  }

  if (fields.productName) {
    parts.push(
      `<text x="${pad}" y="${y + 2.8}" font-size="${fs(3.4)}" font-family="system-ui,sans-serif" font-weight="600" fill="#0f172a">${esc(trunc(entry.name, W > 45 ? 26 : 18))}</text>`,
    )
    y += W > 45 ? 4.2 : 3.6
  }

  if (fields.sizeLine && entry.sizeLine) {
    parts.push(
      `<text x="${pad}" y="${y + 2.2}" font-size="${fs(2.4)}" font-family="system-ui,sans-serif" fill="#64748b">${esc(trunc(entry.sizeLine, 28))}</text>`,
    )
    y += 3.2
  }

  const showQr = fields.qrCode
  const showBar = fields.barcode
  const qrSide = showQr ? Math.min(W * 0.32, H * 0.38, 14) : 0
  const barX = pad
  const barW = showQr ? W - pad * 2 - qrSide - 1 : W - pad * 2
  const codeY = Math.max(y + 1, H * 0.48)
  const barH = Math.min(H * 0.22, 8)

  if (showBar && barW > 8) {
    parts.push(barcodeSvgGroup(entry.sku, {
      x: barX,
      y: codeY,
      width: barW,
      height: barH,
      showText: fields.sku,
      text: entry.sku,
    }))
  } else if (fields.sku && !showBar) {
    parts.push(
      `<text x="${pad}" y="${codeY + 3}" font-size="${fs(2.2)}" font-family="ui-monospace,monospace" fill="#475569">${esc(entry.sku)}</text>`,
    )
  }

  if (showQr) {
    const qx = W - pad - qrSide
    const qy = codeY - 0.5
    const qrData = labelQrPayload(entry.sku)
    parts.push(
      `<image href="${qrImageUrl(qrData, 128)}" x="${qx.toFixed(2)}" y="${qy.toFixed(2)}" width="${qrSide.toFixed(2)}" height="${qrSide.toFixed(2)}" preserveAspectRatio="xMidYMid meet"/>`,
    )
  }

  if (fields.price) {
    parts.push(
      `<text x="${W - pad}" y="${H - pad - 0.5}" text-anchor="end" font-size="${fs(5.5)}" font-family="system-ui,sans-serif" font-weight="800" fill="#0f172a">${esc(fmtPrice(entry.price))}</text>`,
    )
  }

  if (fields.shopCode) {
    parts.push(
      `<text x="${pad}" y="${H - pad}" font-size="${fs(1.9)}" font-family="ui-monospace,monospace" fill="#94a3b8">${esc(entry.shopCode)}</text>`,
    )
  }

  return parts.join('')
}

export function renderSingleLabelSvg(
  entry: LabelEntry,
  W: number,
  H: number,
  fields: LabelFieldConfig,
  style: LabelStyleConfig,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">${renderLabelSvgContent(entry, W, H, fields, style)}</svg>`
}

export function openLabelsPrintWindow(
  entries: LabelEntry[],
  template: { widthMm: number; heightMm: number; cols: number; rows: number },
  fields: LabelFieldConfig,
  style: LabelStyleConfig,
): void {
  const perSheet = template.cols * template.rows
  const expanded: LabelEntry[] = []
  for (const e of entries) {
    for (let c = 0; c < Math.max(1, style.copiesPerProduct); c++) expanded.push(e)
  }

  const sheets: LabelEntry[][] = []
  for (let i = 0; i < expanded.length; i += perSheet) {
    sheets.push(expanded.slice(i, i + perSheet))
  }

  const gapH = 3
  const gapV = 3
  const margin = 10
  const pageW = 210
  const usableW = pageW - margin * 2
  const usableH = 297 - margin * 2
  const cellW = (usableW - (template.cols - 1) * gapH) / template.cols
  const cellH = (usableH - (template.rows - 1) * gapV) / template.rows
  const scale = Math.min(cellW / template.widthMm, cellH / template.heightMm)
  const labelW = template.widthMm * scale
  const labelH = template.heightMm * scale

  const sheetHtml = sheets.map(sheetEntries => {
    const cells: string[] = []
    for (let i = 0; i < perSheet; i++) {
      const entry = sheetEntries[i]
      if (entry) {
        cells.push(
          `<div class="cell"><div class="label-wrap">${renderSingleLabelSvg(entry, template.widthMm, template.heightMm, fields, style)}</div></div>`,
        )
      } else {
        cells.push('<div class="cell cell-empty"></div>')
      }
    }
    return `<div class="sheet" style="grid-template-columns:repeat(${template.cols},${labelW}mm);grid-template-rows:repeat(${template.rows},${labelH}mm)">${cells.join('')}</div>`
  }).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>1to99 Labels</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4 portrait; margin: ${margin}mm; }
  body { font-family: system-ui, sans-serif; background: #fff; }
  .sheet {
    display: grid; gap: ${gapV}mm ${gapH}mm;
    page-break-after: always; width: ${usableW}mm;
  }
  .sheet:last-child { page-break-after: auto; }
  .cell { width: ${labelW}mm; height: ${labelH}mm; display: flex; align-items: center; justify-content: center; }
  .cell-empty { border: 0.2mm dashed #e2e8f0; border-radius: 1mm; }
  .label-wrap svg { width: ${labelW}mm; height: ${labelH}mm; display: block; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>${sheetHtml}
<script>window.onload=function(){setTimeout(function(){window.print();},400);}</script></body></html>`

  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!w) return
  w.document.open()
  w.document.write(html)
  w.document.close()
}
