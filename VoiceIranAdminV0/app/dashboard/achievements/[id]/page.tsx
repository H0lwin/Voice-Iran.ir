'use client'

import { use, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Award, Check, Save, Send, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { EditorPanel } from '@/components/dashboard/editor/editor-panel'
import { EditorShell } from '@/components/dashboard/editor/editor-shell'
import { SeoFields } from '@/components/dashboard/editor/seo-fields'
import { achievementsApi, martyrsApi, mediaApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDate, formatJalaliDateTime, jalaliToGregorianDate } from '@/lib/utils/date'
import { toast } from 'sonner'
import type { Achievement, ContentStatus } from '@/lib/types'

const RichTextEditor = dynamic(
  () => import('@/components/editor/rich-text-editor').then((module) => module.RichTextEditor),
  { ssr: false, loading: () => <div className="h-[320px] animate-pulse rounded-[var(--radius-lg)] border border-border bg-muted" /> },
)

const statusOptions: { label: string; value: ContentStatus }[] = [
  { label: 'پیش‌نویس', value: 'draft' },
  { label: 'در انتظار بررسی', value: 'pending_review' },
  { label: 'منتشرشده', value: 'published' },
  { label: 'بایگانی', value: 'archived' },
]

export default function AchievementEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const isNew = id === 'new'
  const router = useRouter()
  const { canPublish } = usePermission('achievements')

  const [item, setItem] = useState<Achievement | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [martyrOptions, setMartyrOptions] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState('main')
  const [openPanels, setOpenPanels] = useState({
    publish: true,
    display: true,
    info: true,
  })

  const [form, setForm] = useState({
    title: '',
    titleEn: '',
    slug: '',
    excerpt: '',
    excerptEn: '',
    content: '',
    contentEn: '',
    status: 'draft' as ContentStatus,
    verificationStatus: 'pending' as 'pending' | 'verified' | 'rejected',
    categoryId: '',
    targetType: 'air' as 'air' | 'ground' | 'sea' | 'cyber' | 'mixed',
    martyrId: '',
    regionFa: '',
    destroyedTargetsCount: 0,
    strategicGainCount: 0,
    featuredImage: '',
    achievementDate: '',
    achievementDateEn: '',
    location: '',
    locationEn: '',
    participants: '',
    participantsEn: '',
    awards: '',
    awardsEn: '',
    isFeatured: false,
    publishedAt: '',
    metaTitle: '',
    metaTitleEn: '',
    metaDescription: '',
    metaDescriptionEn: '',
    canonicalUrl: '',
  })
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null)
  const saveStateTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, martyrs, loaded] = await Promise.all([
          achievementsApi.getCategories(),
          martyrsApi.getAll({ page: 1, pageSize: 500, status: 'published' }),
          isNew ? Promise.resolve(null) : achievementsApi.getById(id),
        ])
        setCategories(cats.map((cat) => ({ id: cat.id, name: cat.name })))
        setMartyrOptions(martyrs.data.map((item) => ({ id: item.id, name: item.title })))
        if (!loaded) return

        setItem(loaded)
        const normalizeDateEn = (value?: string) => {
          if (!value) return ''
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
          return jalaliToGregorianDate(value)
        }
        const toJalaliInput = (value: string) => (value ? formatJalaliDate(value, 'yyyy/MM/dd') : '')
        const achievementDateEn = normalizeDateEn(loaded.achievementDateEn || loaded.achievementDate)
        setForm({
          title: loaded.title || '',
          titleEn: loaded.titleEn || '',
          slug: loaded.slug || '',
          excerpt: loaded.excerpt || '',
          excerptEn: loaded.excerptEn || '',
          content: loaded.content || '',
          contentEn: loaded.contentEn || '',
          status: loaded.status || 'draft',
          verificationStatus: loaded.verificationStatus || 'pending',
          categoryId: loaded.achievementCategory?.id || '',
          targetType: loaded.targetType || 'air',
          martyrId: loaded.martyrId || '',
          regionFa: loaded.regionFa || '',
          destroyedTargetsCount: loaded.destroyedTargetsCount || 0,
          strategicGainCount: loaded.strategicGainCount || 0,
          featuredImage: loaded.featuredImage || '',
          achievementDate: toJalaliInput(achievementDateEn),
          achievementDateEn,
          location: loaded.location || '',
          locationEn: loaded.locationEn || '',
          participants: (loaded.participants || []).join('، '),
          participantsEn: (loaded.participantsEn || []).join(', '),
          awards: (loaded.awards || []).join('، '),
          awardsEn: (loaded.awardsEn || []).join(', '),
          isFeatured: loaded.isFeatured ?? false,
          publishedAt: loaded.publishedAt?.slice(0, 16) || '',
          metaTitle: loaded.metaTitle || '',
          metaTitleEn: loaded.metaTitleEn || '',
          metaDescription: loaded.metaDescription || '',
          metaDescriptionEn: loaded.metaDescriptionEn || '',
          canonicalUrl: loaded.canonicalUrl || '',
        })
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [id, isNew])

  useEffect(() => {
    if (!isNew || !form.title.trim()) return
    const slug = form.title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FFa-z0-9-]/g, '')
    setForm((prev) => ({ ...prev, slug }))
  }, [form.title, isNew])

  const subtitle = useMemo(() => {
    if (saveState === 'saving') return 'در حال ذخیره...'
    if (saveState === 'saved' && lastSavedAt) {
      return `ذخیره شد — ${lastSavedAt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`
    }
    if (saveState === 'error') return 'ذخیره ناموفق — تلاش مجدد'
    return isNew ? 'ثبت دستاورد جدید' : 'ویرایش دستاورد'
  }, [isNew, lastSavedAt, saveState])

  const persist = async (nextStatus?: ContentStatus) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('عنوان و شرح دستاورد الزامی هستند')
      return
    }
    setIsSaving(true)
    setSaveState('saving')
    try {
      const selectedCategory = categories.find((cat) => cat.id === form.categoryId)
      const payload: Partial<Achievement> = {
        title: form.title.trim(),
        titleEn: form.titleEn.trim() || undefined,
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim() || undefined,
        excerptEn: form.excerptEn.trim() || undefined,
        content: form.content,
        contentEn: form.contentEn.trim() || undefined,
        status: nextStatus || form.status,
        verificationStatus: form.verificationStatus,
        featuredImage: form.featuredImage || undefined,
        targetType: form.targetType,
        martyrId: form.martyrId || undefined,
        regionFa: form.regionFa || undefined,
        destroyedTargetsCount: Number(form.destroyedTargetsCount || 0),
        strategicGainCount: Number(form.strategicGainCount || 0),
        achievementCategory: selectedCategory
          ? {
              id: selectedCategory.id,
              name: selectedCategory.name,
              slug: selectedCategory.name.replace(/\s+/g, '-'),
              order: 0,
              achievementCount: 0,
            }
          : undefined,
        achievementDate: form.achievementDateEn || undefined,
        achievementDateEn: form.achievementDateEn || undefined,
        location: form.location || undefined,
        locationEn: form.locationEn || undefined,
        participants: form.participants
          .split('،')
          .map((value) => value.trim())
          .filter(Boolean),
        participantsEn: form.participantsEn
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        awards: form.awards
          .split('،')
          .map((value) => value.trim())
          .filter(Boolean),
        awardsEn: form.awardsEn
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        isFeatured: form.isFeatured,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
        metaTitle: form.metaTitle || undefined,
        metaTitleEn: form.metaTitleEn || undefined,
        metaDescription: form.metaDescription || undefined,
        metaDescriptionEn: form.metaDescriptionEn || undefined,
        canonicalUrl: form.canonicalUrl || undefined,
      }

      const saved = isNew ? await achievementsApi.create(payload) : await achievementsApi.update(id, payload)
      setItem(saved)
      setForm((prev) => ({ ...prev, status: saved.status }))
      setIsDirty(false)
      setLastSavedAt(new Date())
      setSaveState('saved')
      if (saveStateTimer.current) clearTimeout(saveStateTimer.current)
      saveStateTimer.current = setTimeout(() => setSaveState('idle'), 2500)
      if (isNew) router.replace(`/dashboard/achievements/${saved.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ذخیره ناموفق بود')
      setSaveState('error')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (!isDirty) return
    if (autosaveTimer.current) clearInterval(autosaveTimer.current)
    autosaveTimer.current = setInterval(() => {
      void persist()
    }, 30000)
    return () => {
      if (autosaveTimer.current) clearInterval(autosaveTimer.current)
    }
  }, [isDirty])

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearInterval(autosaveTimer.current)
      if (saveStateTimer.current) clearTimeout(saveStateTimer.current)
    }
  }, [])

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    if (key === 'achievementDate') {
      const gregorian = jalaliToGregorianDate(String(value))
      setForm((prev) => ({ ...prev, achievementDate: String(value), achievementDateEn: gregorian }))
      setIsDirty(true)
      return
    }
    setForm((prev) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const updateStatus = async (status: ContentStatus) => {
    if (isNew) {
      await persist(status)
      return
    }
    try {
      const updated = await achievementsApi.updateStatus(id, status)
      setItem(updated)
      setForm((prev) => ({ ...prev, status }))
      toast.success('وضعیت با موفقیت به‌روزرسانی شد')
    } catch {
      toast.error('تغییر وضعیت انجام نشد')
    }
  }

  const uploadImage = async (file?: File) => {
    if (!file) return
    try {
      const uploaded = await mediaApi.uploadImage(file)
      setField('featuredImage', uploaded)
      toast.success('تصویر دستاورد آپلود شد')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'آپلود تصویر ناموفق بود')
    }
  }

  if (isLoading) return <div className="h-[600px] animate-pulse rounded-[var(--radius-lg)] bg-muted" />

  const historyRows = [
    { label: 'ایجاد', at: item?.createdAt },
    { label: 'ویرایش', at: item?.updatedAt },
    { label: 'انتشار', at: item?.publishedAt },
  ].filter((entry) => entry.at)

  return (
    <EditorShell
      title={isNew ? 'دستاورد جدید' : 'ویرایش دستاورد'}
      subtitle={subtitle}
      onBack={() => router.push('/dashboard/achievements')}
      actions={
        <>
          {!isNew && <StatusBadge status={form.status} />}
          <Button variant="outline" disabled={isSaving} onClick={() => void persist()}>
            <Save className="me-1 size-4" />
            ذخیره
          </Button>
          {form.status === 'draft' && (
            <Button disabled={isSaving} onClick={() => void updateStatus('pending_review')}>
              <Send className="me-1 size-4" />
              ارسال برای بررسی
            </Button>
          )}
          {canPublish && form.status !== 'published' && (
            <Button disabled={isSaving} onClick={() => void updateStatus('published')}>
              <Check className="me-1 size-4" />
              انتشار
            </Button>
          )}
        </>
      }
      sidebar={
        <>
          <EditorPanel
            title="وضعیت انتشار"
            icon={Award}
            open={openPanels.publish}
            onOpenChange={() => setOpenPanels((prev) => ({ ...prev, publish: !prev.publish }))}
          >
            <div className="space-y-3">
              <Label className="text-small">وضعیت</Label>
              <Select value={form.status} onValueChange={(value: ContentStatus) => setField('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <Label className="text-small">زمان انتشار</Label>
                <Input type="datetime-local" value={form.publishedAt} onChange={(e) => setField('publishedAt', e.target.value)} />
              </div>
            </div>
          </EditorPanel>

          <EditorPanel
            title="تنظیمات نمایشی"
            icon={Settings2}
            open={openPanels.display}
            onOpenChange={() => setOpenPanels((prev) => ({ ...prev, display: !prev.display }))}
          >
            <div className="space-y-3">
              <div>
                <Label className="text-small">وضعیت تأیید</Label>
                <Select
                  value={form.verificationStatus}
                  disabled={!canPublish}
                  onValueChange={(value: 'pending' | 'verified' | 'rejected') => setField('verificationStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">در انتظار</SelectItem>
                    <SelectItem value="verified">تأیید شده</SelectItem>
                    <SelectItem value="rejected">رد شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="achievement-featured">نمایش ویژه</Label>
                <Switch id="achievement-featured" checked={form.isFeatured} onCheckedChange={(checked) => setField('isFeatured', checked)} />
              </div>
            </div>
          </EditorPanel>

          <EditorPanel
            title="اطلاعات رکورد"
            open={openPanels.info}
            onOpenChange={() => setOpenPanels((prev) => ({ ...prev, info: !prev.info }))}
          >
            <div className="space-y-2 text-small">
              <p>شناسه: {item ? `#${item.id}` : '—'}</p>
              <p>بازدید: {(item?.viewCount || 0).toLocaleString('fa-IR')}</p>
              <p>ایجاد: {item?.createdAt ? formatJalaliDateTime(item.createdAt) : '—'}</p>
              <p>بروزرسانی: {item?.updatedAt ? formatJalaliDateTime(item.updatedAt) : '—'}</p>
            </div>
          </EditorPanel>
        </>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="main">اطلاعات اصلی</TabsTrigger>
          <TabsTrigger value="seo">سئو</TabsTrigger>
          <TabsTrigger value="translations">ترجمه‌ها</TabsTrigger>
          <TabsTrigger value="history">تاریخچه</TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-4">
          <Input
            placeholder="عنوان دستاورد..."
            className="h-auto border-0 border-b border-transparent px-0 text-[30px] font-medium leading-[42px] rounded-none focus-visible:border-primary focus-visible:ring-0"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">نامک آدرس</Label>
              <Input value={form.slug} onChange={(e) => setField('slug', e.target.value)} />
            </div>
            <div>
              <Label className="text-small">دسته‌بندی</Label>
              <Select value={form.categoryId} onValueChange={(value) => setField('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-small">نوع هدف</Label>
              <Select value={form.targetType} onValueChange={(value: 'air' | 'ground' | 'sea' | 'cyber' | 'mixed') => setField('targetType', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="air">هوایی</SelectItem>
                  <SelectItem value="ground">زمینی</SelectItem>
                  <SelectItem value="sea">دریایی</SelectItem>
                  <SelectItem value="cyber">سایبری</SelectItem>
                  <SelectItem value="mixed">ترکیبی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-small">شهید مرتبط</Label>
              <Select value={form.martyrId || 'none'} onValueChange={(value) => setField('martyrId', value === 'none' ? '' : value)}>
                <SelectTrigger><SelectValue placeholder="اختیاری" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون شهید مرتبط</SelectItem>
                  {martyrOptions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-small">منطقه</Label>
              <Input value={form.regionFa} onChange={(e) => setField('regionFa', e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">تعداد اهداف منهدم‌شده</Label>
              <Input type="number" min={0} value={form.destroyedTargetsCount} onChange={(e) => setField('destroyedTargetsCount', Number(e.target.value || 0))} />
            </div>
            <div>
              <Label className="text-small">دستاوردهای راهبردی</Label>
              <Input type="number" min={0} value={form.strategicGainCount} onChange={(e) => setField('strategicGainCount', Number(e.target.value || 0))} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">تاریخ دستاورد</Label>
              <Input value={form.achievementDate} onChange={(e) => setField('achievementDate', e.target.value)} placeholder="مثال: ۱۴۰۵/۰۱/۱۷" />
            </div>
            <div>
              <Label className="text-small">مکان</Label>
              <Input value={form.location} onChange={(e) => setField('location', e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">مشارکت‌کنندگان (با «،» جدا کنید)</Label>
              <Textarea rows={2} value={form.participants} onChange={(e) => setField('participants', e.target.value)} />
            </div>
            <div>
              <Label className="text-small">افتخارات / جوایز (با «،» جدا کنید)</Label>
              <Textarea rows={2} value={form.awards} onChange={(e) => setField('awards', e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-small">خلاصه</Label>
            <Textarea rows={3} value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} />
          </div>
          <div>
            <Label className="text-small">تصویر شاخص</Label>
            <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void uploadImage(e.target.files?.[0])} />
            {form.featuredImage ? <img src={form.featuredImage} alt="achievement" className="mt-3 h-40 w-full rounded-[var(--radius-md)] object-cover" /> : null}
          </div>
          <RichTextEditor content={form.content} onChange={(value) => setField('content', value)} placeholder="شرح کامل دستاورد..." />
        </TabsContent>

        <TabsContent value="seo">
          <SeoFields
            metaTitle={form.metaTitle}
            metaDescription={form.metaDescription}
            metaTitleEn={form.metaTitleEn}
            metaDescriptionEn={form.metaDescriptionEn}
            canonicalUrl={form.canonicalUrl}
            slug={form.slug}
            onMetaTitleChange={(value) => setField('metaTitle', value)}
            onMetaTitleEnChange={(value) => setField('metaTitleEn', value)}
            onMetaDescriptionChange={(value) => setField('metaDescription', value)}
            onMetaDescriptionEnChange={(value) => setField('metaDescriptionEn', value)}
            onCanonicalUrlChange={(value) => setField('canonicalUrl', value)}
          />
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <div>
            <Label className="text-small">عنوان انگلیسی</Label>
            <Input value={form.titleEn} onChange={(e) => setField('titleEn', e.target.value)} />
          </div>
          <div>
            <Label className="text-small">خلاصه انگلیسی</Label>
            <Textarea rows={3} value={form.excerptEn} onChange={(e) => setField('excerptEn', e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">تاریخ میلادی (خودکار)</Label>
              <Input value={form.achievementDateEn} readOnly placeholder="YYYY-MM-DD" />
            </div>
            <div>
              <Label className="text-small">مکان انگلیسی</Label>
              <Input value={form.locationEn} onChange={(e) => setField('locationEn', e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">مشارکت‌کنندگان انگلیسی (Comma separated)</Label>
              <Textarea rows={2} value={form.participantsEn} onChange={(e) => setField('participantsEn', e.target.value)} />
            </div>
            <div>
              <Label className="text-small">جوایز انگلیسی (Comma separated)</Label>
              <Textarea rows={2} value={form.awardsEn} onChange={(e) => setField('awardsEn', e.target.value)} />
            </div>
          </div>
          <RichTextEditor content={form.contentEn} onChange={(value) => setField('contentEn', value)} placeholder="English content..." />
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {historyRows.length === 0 ? (
            <p className="text-small text-muted-foreground">تاریخچه‌ای ثبت نشده است.</p>
          ) : (
            historyRows.map((row, index) => (
              <div key={index} className="flex items-start gap-2 text-small">
                <span className="mt-2 size-2 rounded-full bg-primary" />
                <p>{row.label}: {row.at ? formatJalaliDateTime(row.at) : '—'}</p>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </EditorShell>
  )
}
