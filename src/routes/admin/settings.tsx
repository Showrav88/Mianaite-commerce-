import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Check, Layers, Upload, Cloud } from 'lucide-react'
import { uploadToCloudinary, cloudinaryConfigured } from '@/lib/cloudinary'
import { useAdminStore, type ShopTheme } from '@/lib/admin-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'


const ALL_COVERS = [
  { id: 'mood_street', name: 'Street Fashion BD', nameBn: 'স্ট্রিট ফ্যাশন', grad: ['#0a0a0a', '#1a1a2e'], accent: '#c9a84c', icons: ['👕', '🏙️', '🌆'], shopSpecific: 'shop_5' },
  { id: 'mood_gold', name: 'Gold Edition', nameBn: 'গোল্ড এডিশন', grad: ['#1a1a2e', '#0f0c29'], accent: '#ffd700', icons: ['👑', '✨', '💛'], shopSpecific: 'shop_5' },
  { id: 'eid_fitr', name: 'Eid-ul-Fitr Sale', nameBn: 'ঈদুল ফিতর সেল', grad: ['#0d4f3c', '#1a6b50'], accent: '#ffd700', icons: ['🌙', '⭐', '🕌'] },
  { id: 'puja', name: 'Puja Festival Sale', nameBn: 'পূজা উৎসব সেল', grad: ['#7c2d12', '#b45309'], accent: '#ffa500', icons: ['🪔', '🌸', '🎊'] },
  { id: 'boishakh', name: 'Pohela Boishakh', nameBn: 'পহেলা বৈশাখ', grad: ['#7f1d1d', '#b91c1c'], accent: '#fef3c7', icons: ['🎨', '🌺', '🎭'] },
  { id: 'eid_adha', name: 'Eid-ul-Adha Sale', nameBn: 'ঈদুল আযহা সেল', grad: ['#78350f', '#c2820a'], accent: '#fde68a', icons: ['🌙', '🐑', '⭐'] },
  { id: 'summer', name: 'Summer Sale', nameBn: 'গ্রীষ্মকালীন সেল', grad: ['#0c4a6e', '#0369a1'], accent: '#7dd3fc', icons: ['☀️', '🌊', '🌴'] },
  { id: 'winter', name: 'Winter Collection', nameBn: 'শীতকালীন কালেকশন', grad: ['#1e1b4b', '#1e3a5f'], accent: '#93c5fd', icons: ['❄️', '🧣', '⛄'] },
]

export const Route = createFileRoute('/admin/settings')({
  component: SettingsPage,
  head: () => ({ meta: [{ title: 'Settings — Admin' }] }),
})

function LogoUploader({ logo, onChange, lang }: { logo: string; onChange: (url: string) => void; lang: 'en' | 'bn' }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (cloudinaryConfigured) {
      setUploading(true)
      const url = await uploadToCloudinary(file)
      setUploading(false)
      if (url) { onChange(url); return }
    }
    const reader = new FileReader()
    reader.onload = ev => { if (ev.target?.result) onChange(ev.target.result as string) }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      <Label>{tx('Shop Logo', 'শপ লোগো')}</Label>
      <div className="flex items-center gap-3">
        {logo ? (
          <img src={logo} alt="Logo" className="h-14 w-14 object-cover rounded-xl border shadow shrink-0" />
        ) : (
          <div className="h-14 w-14 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 text-slate-300" />
          </div>
        )}
        <div className="space-y-1.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-50"
          >
            {cloudinaryConfigured ? <Cloud className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? (tx('Uploading…', 'আপলোড হচ্ছে…')) : (tx('Upload logo', 'লোগো আপলোড'))}
          </button>
          <Input
            value={logo}
            onChange={e => onChange(e.target.value)}
            placeholder="/shops/logo.jpg or https://..."
            className="text-xs"
          />
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {!cloudinaryConfigured && (
        <p className="text-[11px] text-amber-600">
          {lang === 'en'
            ? 'Tip: Configure Cloudinary in .env for permanent cloud storage. See src/lib/cloudinary.ts for setup.'
            : 'টিপ: স্থায়ী ক্লাউড স্টোরেজের জন্য .env-এ Cloudinary কনফিগার করুন।'}
        </p>
      )}
    </div>
  )
}

function SettingsPage() {
  const { user } = useAuth()
  const { shops, setShops } = useAdminStore()
  const { t, lang, setLang, tx } = useI18n()
  const [saved, setSaved] = useState(false)

  const shop = shops.find(s => s.id === user?.shopId)
  const primaryColor = shop?.theme.primaryColor ?? '#f97316'

  const [profile, setProfile] = useState({ name: shop?.name ?? '', description: shop?.description ?? '', logo: shop?.logo ?? '', motto: shop?.motto ?? '' })
  const [contact, setContact] = useState({ email: shop?.contactEmail ?? '', phone: shop?.contactPhone ?? '', address: shop?.address ?? '', facebookPageUrl: shop?.facebookPageUrl ?? '', facebookGroupUrl: shop?.facebookGroupUrl ?? '' })
  const [theme, setTheme] = useState<ShopTheme>(shop?.theme ?? { primaryColor: '#f97316', accentColor: '#ea580c', borderRadius: 'medium', fontFamily: 'Inter' })
  const [activeCoverId, setActiveCoverId] = useState(shop?.activeCoverId ?? '')

  useEffect(() => {
    if (shop) {
      setProfile({ name: shop.name, description: shop.description, logo: shop.logo ?? '', motto: shop.motto ?? '' })
      setContact({ email: shop.contactEmail ?? '', phone: shop.contactPhone ?? '', address: shop.address ?? '', facebookPageUrl: shop.facebookPageUrl ?? '', facebookGroupUrl: shop.facebookGroupUrl ?? '' })
      setTheme(shop.theme)
      setActiveCoverId(shop.activeCoverId ?? '')
    }
  }, [shop?.id])

  function saveAll() {
    setShops(shops.map(s => s.id === user?.shopId
      ? { ...s, name: profile.name, description: profile.description, logo: profile.logo, motto: profile.motto, contactEmail: contact.email, contactPhone: contact.phone, address: contact.address, facebookPageUrl: contact.facebookPageUrl, facebookGroupUrl: contact.facebookGroupUrl, theme, activeCoverId: activeCoverId || undefined }
      : s
    ))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const RADIUS_OPTIONS: ShopTheme['borderRadius'][] = ['sharp', 'medium', 'rounded']
  const FONT_OPTIONS: ShopTheme['fontFamily'][] = ['Inter', 'Poppins', 'Roboto']

  if (!shop) return <div className="p-6 text-muted-foreground">{tx('Shop not found.', 'শপ পাওয়া যায়নি।')}</div>

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.settings')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{shop.name}</p>
        </div>
        <Button onClick={saveAll} className="gap-2 text-white" style={{ backgroundColor: primaryColor }}>
          {saved ? <><Check className="w-4 h-4" /> {tx('Saved!', 'সংরক্ষিত!')}</> : t('admin.save')}
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="profile">{t('admin.profile')}</TabsTrigger>
          <TabsTrigger value="theme">{t('admin.theme')}</TabsTrigger>
          <TabsTrigger value="contact">{t('admin.contact')}</TabsTrigger>
          <TabsTrigger value="cover">{tx('Cover Photo', 'কভার ফটো')}</TabsTrigger>
          <TabsTrigger value="language">{tx('Language', 'ভাষা')}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">{t('admin.profile')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t('admin.shopName')}</Label>
                <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{tx('Description', 'বিবরণ')}</Label>
                <Input value={profile.description} onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} />
              </div>
              <LogoUploader logo={profile.logo} onChange={logo => setProfile(p => ({ ...p, logo }))} lang={lang} />
              <div className="space-y-1.5">
                <Label>{tx('Motto / Tagline', 'মোটো / ট্যাগলাইন')}</Label>
                <Input value={profile.motto} onChange={e => setProfile(p => ({ ...p, motto: e.target.value }))} placeholder={tx('Your brand tagline...', 'আপনার ব্র্যান্ডের ট্যাগলাইন...')} />
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">{t('admin.theme')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">{tx('Primary Color', 'প্রাথমিক রং')}</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={theme.primaryColor} onChange={e => setTheme(t => ({ ...t, primaryColor: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border p-0.5" />
                    <Input value={theme.primaryColor} onChange={e => setTheme(t => ({ ...t, primaryColor: e.target.value }))} className="font-mono text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{tx('Accent Color', 'অ্যাকসেন্ট রং')}</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={theme.accentColor} onChange={e => setTheme(t => ({ ...t, accentColor: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border p-0.5" />
                    <Input value={theme.accentColor} onChange={e => setTheme(t => ({ ...t, accentColor: e.target.value }))} className="font-mono text-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{tx('Button Style', 'বাটন স্টাইল')}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {RADIUS_OPTIONS.map(r => (
                    <button key={r} onClick={() => setTheme(t => ({ ...t, borderRadius: r }))}
                      className={`py-2 text-sm border transition-all ${theme.borderRadius === r ? 'font-medium' : 'border-slate-200 text-slate-500'}`}
                      style={{ borderRadius: r === 'sharp' ? '4px' : r === 'medium' ? '8px' : '20px', ...(theme.borderRadius === r ? { borderColor: primaryColor, backgroundColor: primaryColor + '10', color: primaryColor } : {}) }}
                    >
                      {r === 'sharp' ? (tx('Sharp', 'তীক্ষ্ণ')) : r === 'medium' ? (tx('Medium', 'মাঝারি')) : (tx('Rounded', 'গোলাকার'))}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{tx('Font', 'ফন্ট')}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {FONT_OPTIONS.map(f => (
                    <button key={f} onClick={() => setTheme(t => ({ ...t, fontFamily: f }))}
                      style={{ fontFamily: f, ...(theme.fontFamily === f ? { borderColor: primaryColor, backgroundColor: primaryColor + '10', color: primaryColor } : {}) }}
                      className={`py-2 text-sm border rounded-lg transition-all ${theme.fontFamily === f ? 'font-medium' : 'border-slate-200 text-slate-500'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mini preview */}
              <div className="border rounded-xl p-4 space-y-2" style={{ fontFamily: theme.fontFamily }}>
                <p className="text-xs font-medium text-muted-foreground">{tx('Preview', 'প্রিভিউ')}</p>
                <button className="text-white text-sm px-5 py-2 font-medium" style={{ backgroundColor: theme.primaryColor, borderRadius: theme.borderRadius === 'sharp' ? '4px' : theme.borderRadius === 'medium' ? '8px' : '20px' }}>
                  {tx('Shop Now', 'এখনই কিনুন')}
                </button>
                <div className="flex gap-2">
                  <div className="w-20 h-24 bg-slate-100 rounded" style={{ borderRadius: theme.borderRadius === 'sharp' ? '2px' : theme.borderRadius === 'medium' ? '6px' : '12px' }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <p className="font-bold text-sm" style={{ color: theme.primaryColor }}>৳1,999</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4"><CardTitle className="text-base">{t('admin.contact')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t('admin.email')}</Label>
                <Input type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.phone')}</Label>
                <Input value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} placeholder="017..." />
              </div>
              <div className="space-y-1.5">
                <Label>{tx('Business Address', 'ব্যবসার ঠিকানা')}</Label>
                <Input value={contact.address} onChange={e => setContact(c => ({ ...c, address: e.target.value }))} />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><span className="text-base">f</span> {tx('Facebook Page URL', 'ফেসবুক পেজ লিংক')}</Label>
                <Input value={contact.facebookPageUrl} onChange={e => setContact(c => ({ ...c, facebookPageUrl: e.target.value }))} placeholder="https://facebook.com/yourpage" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><span className="text-base">👥</span> {tx('Facebook Group URL', 'ফেসবুক গ্রুপ লিংক')}</Label>
                <Input value={contact.facebookGroupUrl} onChange={e => setContact(c => ({ ...c, facebookGroupUrl: e.target.value }))} placeholder="https://facebook.com/groups/..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cover Photo Tab */}
        <TabsContent value="cover">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4" />
                {tx('Cover Photo Design', 'কভার ফটো ডিজাইন')}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {tx('Select which cover design appears first on your shop homepage.', 'আপনার শপের হোমপেজে কোন কভার ডিজাইনটি প্রথমে দেখাবে তা বেছে নিন।')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALL_COVERS.filter(c => !c.shopSpecific || c.shopSpecific === user?.shopId).map(cover => {
                  const isActive = activeCoverId === cover.id
                  return (
                    <button
                      key={cover.id}
                      onClick={() => setActiveCoverId(isActive ? '' : cover.id)}
                      className="relative rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
                      style={{ borderColor: isActive ? primaryColor : 'transparent', boxShadow: isActive ? `0 0 0 2px ${primaryColor}30` : undefined }}
                    >
                      {/* Mini preview */}
                      <div
                        className="h-16 flex items-center justify-center gap-1 text-2xl"
                        style={{ background: `linear-gradient(135deg, ${cover.grad[0]}, ${cover.grad[1]})` }}
                      >
                        {cover.icons.map((icon, i) => <span key={i}>{icon}</span>)}
                      </div>
                      <div className="px-2.5 py-2 bg-white">
                        <p className="text-xs font-semibold text-gray-800 truncate">{tx(cover.name, cover.nameBn)}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cover.accent }} />
                          {cover.shopSpecific && <span className="text-[10px] text-purple-500 font-medium">Exclusive</span>}
                        </div>
                      </div>
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {tx('💡 The selected cover shows first. Visitors can browse others via arrows.', '💡 নির্বাচিত কভার প্রথমে দেখাবে। দর্শনার্থীরা অন্যগুলো তীর বোতাম দিয়ে দেখতে পারবে।')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4"><CardTitle className="text-base">{tx('Language Preference', 'ভাষা পছন্দ')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {tx('Choose the language for your admin panel.', 'আপনার অ্যাডমিন প্যানেলের ভাষা বেছে নিন।')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'en' as const, label: 'English', native: 'English', flag: '🇬🇧' },
                  { value: 'bn' as const, label: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
                ].map(l => (
                  <button
                    key={l.value}
                    onClick={() => setLang(l.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${lang === l.value ? 'border-current' : 'border-slate-200 hover:border-slate-400'}`}
                    style={lang === l.value ? { borderColor: primaryColor, backgroundColor: primaryColor + '08' } : {}}
                  >
                    <span className="text-2xl">{l.flag}</span>
                    <div>
                      <p className="font-semibold text-sm">{l.native}</p>
                      <p className="text-xs text-muted-foreground">{l.label}</p>
                    </div>
                    {lang === l.value && <Check className="w-4 h-4 ml-auto" style={{ color: primaryColor }} />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
