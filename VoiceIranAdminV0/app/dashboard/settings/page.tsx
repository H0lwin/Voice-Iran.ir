'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { settingsApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import type { SiteSettings } from '@/lib/types'
import { toast } from 'sonner'

export default function CoreSettingsPage() {
  const { hasPermission } = usePermission('core')
  const [initial, setInitial] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, watch, setValue } = useForm<SiteSettings>()

  useEffect(() => {
    if (!hasPermission) return
    settingsApi.getSiteSettings().then((s) => {
      setInitial(s)
      reset(s)
    })
  }, [hasPermission, reset])

  const maintenance = watch('maintenanceMode')

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true)
    try {
      const updated = await settingsApi.updateSiteSettings(values)
      setInitial(updated)
      reset(updated)
      toast.success('تنظیمات ذخیره شد')
    } catch {
      toast.error('ذخیره ناموفق بود')
    } finally {
      setSaving(false)
    }
  })

  if (!hasPermission) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border p-8 text-center text-muted-foreground">
        فقط مدیر ارشد به تنظیمات هسته دسترسی دارد.
      </div>
    )
  }

  if (!initial) {
    return <Skeleton className="h-[480px] rounded-[var(--radius-lg)]" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>تنظیمات هسته</h1>
        <p className="text-muted-foreground">نام سایت، تماس و حالت تعمیرات</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">عمومی</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="siteName">نام سایت</Label>
              <Input id="siteName" {...register('siteName')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="siteNameEn">نام انگلیسی (اختیاری)</Label>
              <Input id="siteNameEn" dir="ltr" className="text-left" {...register('siteNameEn')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="siteDescription">توضیح کوتاه</Label>
              <Textarea id="siteDescription" rows={3} {...register('siteDescription')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">ایمیل تماس</Label>
              <Input id="contactEmail" dir="ltr" className="text-left" type="email" {...register('contactEmail')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">تلفن تماس</Label>
              <Input id="contactPhone" {...register('contactPhone')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">آدرس</Label>
              <Textarea id="address" rows={2} {...register('address')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">تعمیرات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="maint">حالت تعمیرات</Label>
                <p className="text-caption text-muted-foreground">بازدیدکنندگان پیام زیر را می‌بینند</p>
              </div>
              <Switch
                id="maint"
                checked={Boolean(maintenance)}
                onCheckedChange={(v) => setValue('maintenanceMode', v, { shouldDirty: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintMsg">پیام تعمیرات</Label>
              <Textarea id="maintMsg" rows={2} {...register('maintenanceMessage')} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
          </Button>
        </div>
      </form>
    </div>
  )
}
