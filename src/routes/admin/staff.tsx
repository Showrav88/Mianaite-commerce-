import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Users, Banknote } from 'lucide-react'
import { useOfficeStore } from '@/lib/office-store'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { fmt } from '@/lib/admin-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const Route = createFileRoute('/admin/staff')({
  component: StaffPage,
  head: () => ({ meta: [{ title: 'Staff — 1to99' }] }),
})

function StaffPage() {
  const { staff, addStaff, paySalary } = useOfficeStore()
  const { user } = useAuth()
  const { t } = useI18n()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'manager' | 'staff'>('staff')
  const [salary, setSalary] = useState('14000')

  if (user?.role !== 'owner') {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {t('staff.ownerOnly')}
      </div>
    )
  }

  function addMember(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addStaff({
      name: name.trim(),
      phone: phone.trim(),
      role,
      monthlySalary: Number(salary) || 0,
      active: true,
    })
    setName('')
    setPhone('')
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-7 h-7 text-orange-500" />
          {t('staff.title')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t('staff.subtitle')}</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">{t('staff.addTitle')}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={addMember} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('admin.name')}</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t('admin.phone')}</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('staff.role')}</Label>
              <Select value={role} onValueChange={v => setRole(v as 'manager' | 'staff')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">{t('login.roleManager')}</SelectItem>
                  <SelectItem value="staff">{t('login.roleStaff')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('staff.monthlySalary')}</Label>
              <Input type="number" value={salary} onChange={e => setSalary(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">{t('staff.addBtn')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {staff.map(s => (
          <Card key={s.id} className="border-0 shadow-sm">
            <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{s.name}</p>
                  <Badge variant="secondary">
                    {s.role === 'manager' ? t('login.roleManager') : t('login.roleStaff')}
                  </Badge>
                  {!s.active && <Badge variant="outline">{t('staff.inactive')}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {s.phone} · {fmt(s.monthlySalary)}/{t('staff.perMonth')}
                </p>
                {s.lastPaidAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('staff.lastPaid')}: {s.lastPaidAt}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="gap-2 shrink-0"
                onClick={() => paySalary(s.id, s.monthlySalary, 'cash')}
              >
                <Banknote className="w-4 h-4" />
                {t('staff.paySalary')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
