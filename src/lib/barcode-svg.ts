/** Code 39 patterns (9 elements: wide=2 narrow=1 width units). */
const CODE39 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%'
const PATTERNS = [
  'nnnwwnnnw', 'wwnnnnnnw', 'nnwwnnnnw', 'wwnwwnnnn', 'nnnnwwnnw',
  'wnnnwwnnn', 'nwnnwwnnn', 'nnnnnwwnw', 'wnnnnwwnn', 'nwnnnwwnn',
  'wnwnnnnnw', 'nwwnnnnnw', 'wwwnnnnnn', 'nnnwwnnnw', 'wnnwwnnnn',
  'nnwwwnnnn', 'nnnnwwwnw', 'wnnnwwwnn', 'nwnnwwwnn', 'nnwnwwwnn',
  'wwnnnnwnw', 'nwwnnnwnn', 'wwwnnnwnn', 'nnwnnwnnw', 'wnwnnwnnn',
  'nwwnnwnnn', 'nnwwnwnnw', 'nnnwnwnnw', 'wnnwnwnnn', 'nnnwnnwnw',
  'wnnwnnwnn', 'nnwwnnwnn', 'nnnnwnwnw', 'wnnnwnwnn', 'nwnnwnwnn',
  'nnnnnnwww', 'wnnnnnwwn', 'nwnnnnwwn', 'nnwnnnwwn', 'wwnnnnwwn',
  'nwwnnnwwn', 'wwwnnnwwn', 'nnnwnnwwn', 'wnnwnnwwn', 'nwnwnnwwn',
  'nnwwnnwwn', 'wwwnnnnwn', 'nnwnwnnwn', 'wnwnwnnwn', 'nnnnwwnwn',
]

function patternToModules(pattern: string): number[] {
  const units: number[] = []
  for (const ch of pattern) {
    units.push(ch === 'w' ? 2 : 1)
  }
  return units
}

/** Code 39 with * start/stop — scannable for typical SKUs. */
export function code39Modules(text: string): number[] {
  const upper = text.toUpperCase()
  const chars = `*${upper}*`
  const modules: number[] = []
  for (let i = 0; i < chars.length; i++) {
    const idx = CODE39.indexOf(chars[i]!)
    if (idx < 0) continue
    const pat = patternToModules(PATTERNS[idx]!)
    for (let j = 0; j < pat.length; j++) {
      modules.push(pat[j]!)
    }
    if (i < chars.length - 1) modules.push(1)
  }
  return modules
}

export interface BarcodeSvgOptions {
  x: number
  y: number
  width: number
  height: number
  barColor?: string
  text?: string
  showText?: boolean
}

/** Renders Code 39 bars inside label viewBox coordinates (mm). */
export function barcodeSvgGroup(text: string, opts: BarcodeSvgOptions): string {
  const modules = code39Modules(text)
  const totalUnits = modules.reduce((a, b) => a + b, 0)
  const unitW = opts.width / totalUnits
  let x = opts.x
  const lines: string[] = []
  let isBar = true
  for (const w of modules) {
    const segW = w * unitW
    if (isBar) {
      lines.push(
        `<rect x="${x.toFixed(2)}" y="${opts.y.toFixed(2)}" width="${segW.toFixed(2)}" height="${opts.height.toFixed(2)}" fill="${opts.barColor ?? '#0f172a'}"/>`,
      )
    }
    x += segW
    isBar = !isBar
  }
  if (opts.showText !== false && opts.text) {
    lines.push(
      `<text x="${(opts.x + opts.width / 2).toFixed(2)}" y="${(opts.y + opts.height + 2.8).toFixed(2)}" text-anchor="middle" font-size="2.2" font-family="ui-monospace,monospace" fill="#64748b">${escapeXml(opts.text)}</text>`,
    )
  }
  return lines.join('')
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}
