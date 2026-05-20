import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { useAdminStore, type ShopTheme } from '@/lib/admin-store'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/superadmin/customization')({
  component: CustomizationPage,
  head: () => ({ meta: [{ title: 'Customization — Super Admin' }] }),
})

const RADIUS_OPTIONS: ShopTheme['borderRadius'][] = ['sharp', 'medium', 'rounded']
const FONT_OPTIONS: ShopTheme['fontFamily'][] = ['Inter', 'Poppins', 'Roboto']

function Preview({ theme, shopName }: { theme: ShopTheme; shopName: string }) {
  const radiusMap = { sharp: '0px', medium: '8px', rounded: '20px' }
  const radius = radiusMap[theme.borderRadius]
  return (
    <div style={{ fontFamily: theme.fontFamily }} className="border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Mock navbar */}
      <div style={{ backgroundColor: theme.primaryColor }} className="px-4 py-3 flex items-center gap-2">
        <div className="w-6 h-6 bg-white/30 rounded flex items-center justify-center text-white text-xs font-bold">
          {shopName.charAt(0)}
        </div>
        <span className="text-white font-semibold text-sm">{shopName}</span>
        <div className="ml-auto flex gap-1.5">
          {['Home', 'Shop'].map(l => (
            <span key={l} className="text-white/80 text-xs">{l}</span>
          ))}
        </div>
      </div>
      {/* Mock hero */}
      <div style={{ backgroundColor: theme.accentColor + '15' }} className="px-4 py-5">
        <p className="font-bold text-lg" style={{ color: theme.primaryColor }}>Shop Smarter</p>
        <p className="text-sm text-slate-500 mt-1">Great deals delivered to you</p>
        <button
          style={{ backgroundColor: theme.primaryColor, borderRadius: radius, fontFamily: theme.fontFamily }}
          className="mt-3 text-white text-xs px-4 py-1.5 font-medium"
        >
          Shop Now
        </button>
      </div>
      {/* Mock product cards */}
      <div className="grid grid-cols-3 gap-2 p-3">
        {['Product A', 'Product B', 'Product C'].map(name => (
          <div key={name} style={{ borderRadius: radius }} className="border bg-slate-50 p-2">
            <div className="aspect-square bg-slate-200 rounded-sm mb-1.5" />
            <p className="text-[10px] font-medium text-slate-700 leading-tight">{name}</p>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: theme.primaryColor }}>৳1,999</p>
            <button
              style={{ backgroundColor: theme.accentColor, borderRadius: `calc(${radius} * 0.6)` }}
              className="w-full text-white text-[9px] py-1 mt-1 font-medium"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomizationPage() {
  const { shops, setShops } = useAdminStore()
  const { t, lang } = useI18n()
  const activeShops = shops.filter(s => s.status !== 'inactive')
  const [selectedId, setSelectedId] = useState(activeShops[0]?.id ?? '')
  const [saved, setSaved] = useState<string | null>(null)

  const shop = shops.find(s => s.id === selectedId)

  function updateTheme(patch: Partial<ShopTheme>) {
    setShops(shops.map(s => s.id === selectedId ? { ...s, theme: { ...s.theme, ...patch } } : s))
  }

  function handleSave() {
    setSaved(selectedId)
    setTimeout(() => setSaved(null), 2000)
  }

  if (!shop) return null

  const { theme } = shop

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.shopTheme')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === 'en' ? 'Customize each shop\'s brand colors, typography and style.' : 'প্রতিটি শপের ব্র্যান্ড রং, টাইপোগ্রাফি এবং স্টাইল কাস্টমাইজ করুন।'}
        </p>
      </div>

      {/* Shop selector */}
      <div className="flex flex-wrap gap-2">
        {activeShops.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              s.id === selectedId ? 'text-white border-transparent shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
            style={s.id === selectedId ? { backgroundColor: s.theme.primaryColor } : {}}
          >
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.theme.primaryColor }} />
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{lang === 'en' ? 'Theme Settings' : 'থিম সেটিংস'} — {shop.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Colors */}
            <div>
              <p className="text-sm font-semibold mb-3">{lang === 'en' ? 'Brand Colors' : 'ব্র্যান্ড রং'}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === 'en' ? 'Primary Color' : 'প্রাথমিক রং'}</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={theme.primaryColor}
                        onChange={e => updateTheme({ primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                      />
                    </div>
                    <Input value={theme.primaryColor} onChange={e => updateTheme({ primaryColor: e.target.value })} className="font-mono text-sm h-9 flex-1" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === 'en' ? 'Accent Color' : 'অ্যাকসেন্ট রং'}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={e => updateTheme({ accentColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                    />
                    <Input value={theme.accentColor} onChange={e => updateTheme({ accentColor: e.target.value })} className="font-mono text-sm h-9 flex-1" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Quick color presets */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{lang === 'en' ? 'Color Presets' : 'রং প্রিসেট'}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { p: '#6366f1', a: '#8b5cf6', label: 'Violet' },
                  { p: '#ec4899', a: '#f43f5e', label: 'Rose' },
                  { p: '#22c55e', a: '#16a34a', label: 'Green' },
                  { p: '#f97316', a: '#ea580c', label: 'Orange' },
                  { p: '#06b6d4', a: '#0284c7', label: 'Cyan' },
                  { p: '#eab308', a: '#ca8a04', label: 'Gold' },
                  { p: '#1e293b', a: '#334155', label: 'Dark' },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => updateTheme({ primaryColor: preset.p, accentColor: preset.a })}
                    title={preset.label}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${theme.primaryColor === preset.p ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: preset.p }}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Border radius */}
            <div className="space-y-2">
              <Label>{lang === 'en' ? 'Button & Card Style' : 'বাটন ও কার্ড স্টাইল'}</Label>
              <div className="grid grid-cols-3 gap-2">
                {RADIUS_OPTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => updateTheme({ borderRadius: r })}
                    className={`py-2 text-sm border transition-all ${
                      theme.borderRadius === r ? 'border-violet-500 bg-violet-50 text-violet-700 font-medium' : 'border-slate-200 hover:border-slate-400 text-slate-600'
                    }`}
                    style={{ borderRadius: r === 'sharp' ? '4px' : r === 'medium' ? '8px' : '20px' }}
                  >
                    {r === 'sharp' ? (lang === 'en' ? 'Sharp' : 'তীক্ষ্ণ') : r === 'medium' ? (lang === 'en' ? 'Medium' : 'মাঝারি') : (lang === 'en' ? 'Rounded' : 'গোলাকার')}
                  </button>
                ))}
              </div>
            </div>

            {/* Font */}
            <div className="space-y-1.5">
              <Label>{lang === 'en' ? 'Font Family' : 'ফন্ট ফ্যামিলি'}</Label>
              <div className="grid grid-cols-3 gap-2">
                {FONT_OPTIONS.map(f => (
                  <button
                    key={f}
                    onClick={() => updateTheme({ fontFamily: f })}
                    style={{ fontFamily: f }}
                    className={`py-2 text-sm border rounded-lg transition-all ${
                      theme.fontFamily === f ? 'border-violet-500 bg-violet-50 text-violet-700 font-medium' : 'border-slate-200 hover:border-slate-400 text-slate-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} className="w-full gap-2">
              {saved === selectedId ? <><Check className="w-4 h-4" /> {lang === 'en' ? 'Saved!' : 'সংরক্ষিত!'}</> : t('admin.save')}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{lang === 'en' ? 'Live Preview' : 'লাইভ প্রিভিউ'}</p>
          <Preview theme={theme} shopName={shop.name} />
          <p className="text-xs text-muted-foreground text-center">
            {lang === 'en' ? 'Preview updates in real-time as you change settings' : 'সেটিং পরিবর্তনের সাথে সাথে প্রিভিউ আপডেট হয়'}
          </p>
        </div>
      </div>
    </div>
  )
}
