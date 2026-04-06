'use client'

import { useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { localizationApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import type { LanguageSetting } from '@/lib/types'
import { toast } from 'sonner'

const emptyState: Omit<LanguageSetting, 'id'> = {
  code: '',
  name: '',
  isDefault: false,
  isActive: true,
  direction: 'rtl',
  calendarSystem: 'jalali',
  dateFormat: 'YYYY/MM/DD',
  numberFormat: 'fa-IR',
  fallbackLanguage: undefined,
}

export default function LanguagesPage() {
  const { hasPermission } = usePermission('core')
  const [rows, setRows] = useState<LanguageSetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyState)

  useEffect(() => {
    if (!hasPermission) return
    localizationApi
      .getLanguages()
      .then(setRows)
      .catch(() => {
        toast.error('دریافت زبان‌ها ناموفق بود')
        setRows([])
      })
      .finally(() => setIsLoading(false))
  }, [hasPermission])

  const columns: ColumnDef<LanguageSetting>[] = useMemo(
    () => [
      { accessorKey: 'code', header: 'کد', cell: ({ row }) => <span dir="ltr">{row.original.code}</span> },
      { accessorKey: 'name', header: 'نام' },
      {
        accessorKey: 'direction',
        header: 'جهت',
        cell: ({ row }) => (row.original.direction === 'rtl' ? 'RTL' : 'LTR'),
      },
      {
        accessorKey: 'isDefault',
        header: 'پیش‌فرض',
        cell: ({ row }) => (row.original.isDefault ? 'بله' : 'خیر'),
      },
      {
        accessorKey: 'isActive',
        header: 'فعال',
        cell: ({ row }) => (row.original.isActive ? 'بله' : 'خیر'),
      },
    ],
    [],
  )

  const save = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('کد و نام زبان الزامی است')
      return
    }
    const saved = await localizationApi.saveLanguage(form)
    setRows((prev) => {
      const exists = prev.some((item) => item.id === saved.id)
      if (exists) return prev.map((item) => (item.id === saved.id ? saved : item))
      return [saved, ...prev]
    })
    setModalOpen(false)
    setForm(emptyState)
    toast.success('زبان ذخیره شد')
  }

  if (!hasPermission) {
    return <div className="rounded-[var(--radius-lg)] border border-border p-8 text-center text-muted-foreground">فقط مدیر ارشد به بومی‌سازی دسترسی دارد.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>زبان‌ها</h1>
          <p className="text-muted-foreground">مدیریت زبان‌های فعال سامانه</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="me-2 size-4" />
          زبان جدید
        </Button>
      </div>

      <DataTable columns={columns} data={rows} isLoading={isLoading} emptyState={{ title: 'زبانی ثبت نشده است' }} />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ایجاد زبان</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>کد</Label>
              <Input dir="ltr" value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toLowerCase() }))} />
            </div>
            <div className="space-y-2">
              <Label>نام</Label>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>جهت</Label>
                <Select value={form.direction} onValueChange={(value: 'rtl' | 'ltr') => setForm((prev) => ({ ...prev, direction: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rtl">RTL</SelectItem>
                    <SelectItem value="ltr">LTR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>تقویم</Label>
                <Select value={form.calendarSystem} onValueChange={(value: 'jalali' | 'gregorian') => setForm((prev) => ({ ...prev, calendarSystem: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jalali">jalali</SelectItem>
                    <SelectItem value="gregorian">gregorian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>فرمت تاریخ</Label>
                <Input dir="ltr" value={form.dateFormat} onChange={(e) => setForm((prev) => ({ ...prev, dateFormat: e.target.value }))} />
              </div>
              <div>
                <Label>فرمت عدد</Label>
                <Input dir="ltr" value={form.numberFormat} onChange={(e) => setForm((prev) => ({ ...prev, numberFormat: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="lang-default">پیش‌فرض</Label>
              <Switch id="lang-default" checked={form.isDefault} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isDefault: checked }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="lang-active">فعال</Label>
              <Switch id="lang-active" checked={form.isActive} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>انصراف</Button>
            <Button onClick={() => void save()}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
