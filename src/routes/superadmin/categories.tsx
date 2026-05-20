import { createFileRoute } from '@tanstack/react-router'
import { useAdminStore, ALL_CATEGORIES } from '@/lib/admin-store'
import { useI18n } from '@/lib/i18n'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/superadmin/categories')({
  component: CategoriesPage,
  head: () => ({ meta: [{ title: 'Category Access — Super Admin' }] }),
})

function CategoriesPage() {
  const { shops, setShops } = useAdminStore()
  const { t, lang } = useI18n()

  const activeShops = shops.filter(s => s.status !== 'inactive')

  function toggle(shopId: string, catId: string) {
    setShops(prev => prev.map(s => {
      if (s.id !== shopId) return s
      const has = s.allowedCategories.includes(catId)
      return { ...s, allowedCategories: has ? s.allowedCategories.filter(c => c !== catId) : [...s.allowedCategories, catId] }
    }))
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.categoryAccess')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === 'en'
            ? 'Control which shop can sell which product categories. Changes apply instantly — no save button needed.'
            : 'কোন শপ কোন ক্যাটাগরির পণ্য বিক্রি করতে পারবে তা নিয়ন্ত্রণ করুন। পরিবর্তন তৎক্ষণাৎ প্রয়োগ হয় — সংরক্ষণ বাটনের প্রয়োজন নেই।'}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeShops.map(shop => (
          <Card key={shop.id} className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: shop.theme.primaryColor }}>
                  {shop.name.charAt(0)}
                </div>
                <p className="font-medium text-sm truncate">{shop.name}</p>
              </div>
              <p className="text-2xl font-bold">{shop.allowedCategories.length}</p>
              <p className="text-xs text-muted-foreground">{lang === 'en' ? 'categories allowed' : 'ক্যাটাগরি অনুমোদিত'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Matrix table — desktop */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base">
            {lang === 'en' ? 'Category × Shop Access Matrix' : 'ক্যাটাগরি × শপ অ্যাক্সেস ম্যাট্রিক্স'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-6 py-3 font-medium text-muted-foreground text-left sticky left-0 bg-slate-50 z-10 min-w-[180px]">
                    {lang === 'en' ? 'Category' : 'ক্যাটাগরি'}
                  </th>
                  {activeShops.map(shop => (
                    <th key={shop.id} className="px-4 py-3 font-medium text-center min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: shop.theme.primaryColor }}>
                          {shop.name.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-600 leading-tight">{shop.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {ALL_CATEGORIES.map(cat => {
                  const totalAllowed = activeShops.filter(s => s.allowedCategories.includes(cat.id)).length
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/40">
                      <td className="px-6 py-4 sticky left-0 bg-white hover:bg-slate-50/40 z-10">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{cat.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{lang === 'en' ? cat.name : cat.nameBn}</p>
                            <p className="text-[10px] text-muted-foreground">{totalAllowed}/{activeShops.length} {lang === 'en' ? 'shops' : 'শপ'}</p>
                          </div>
                        </div>
                      </td>
                      {activeShops.map(shop => {
                        const allowed = shop.allowedCategories.includes(cat.id)
                        return (
                          <td key={shop.id} className="px-4 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Switch
                                checked={allowed}
                                onCheckedChange={() => toggle(shop.id, cat.id)}
                                className={allowed ? '[&>span]:bg-white' : ''}
                              />
                              <span className={`text-[10px] font-medium ${allowed ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {allowed ? (lang === 'en' ? 'ON' : 'চালু') : (lang === 'en' ? 'OFF' : 'বন্ধ')}
                              </span>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Per-shop breakdown (mobile-friendly cards) */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          {lang === 'en' ? 'Per-Shop Breakdown' : 'শপ অনুযায়ী বিভাজন'}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {activeShops.map(shop => (
            <Card key={shop.id} className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: shop.theme.primaryColor }}>
                    {shop.name.charAt(0)}
                  </div>
                  <CardTitle className="text-sm">{shop.name}</CardTitle>
                  <Badge variant="outline" className="ml-auto text-xs">{shop.allowedCategories.length} cats</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALL_CATEGORIES.map(cat => {
                    const allowed = shop.allowedCategories.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggle(shop.id, cat.id)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all text-left ${
                          allowed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span className="truncate">{lang === 'en' ? cat.name : cat.nameBn}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
