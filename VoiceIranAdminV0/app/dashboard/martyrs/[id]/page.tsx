'use client'

import { use, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Check, Heart, Save, Send, Settings2 } from 'lucide-react'
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
import { martyrsApi, mediaApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDate, formatJalaliDateTime, jalaliToGregorianDate } from '@/lib/utils/date'
import { toast } from 'sonner'
import type { ContentStatus, Martyr } from '@/lib/types'

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

export default function MartyrEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const isNew = id === 'new'
  const router = useRouter()
  const { canPublish } = usePermission('martyrs')

  const [item, setItem] = useState<Martyr | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [units, setUnits] = useState<{ id: string; name: string }[]>([])
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
    categoryId: '',
    featuredImage: '',
    rank: '',
    rankEn: '',
    unit: '',
    unitId: '',
    unitEn: '',
    birthDate: '',
    birthDateEn: '',
    martyrdomDate: '',
    martyrdomDateEn: '',
    birthPlace: '',
    birthPlaceEn: '',
    martyrdomPlace: '',
    martyrdomPlaceEn: '',
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
        const [cats, unitsResponse, loaded] = await Promise.all([
          martyrsApi.getCategories(),
          martyrsApi.getUnits(),
          isNew ? Promise.resolve(null) : martyrsApi.getById(id),
        ])
        setCategories(cats.map((cat) => ({ id: cat.id, name: cat.name })))
        setUnits(unitsResponse.filter((item) => item.isActive).map((item) => ({ id: item.id, name: item.name })))
        if (!loaded) return

        setItem(loaded)
        const normalizeDateEn = (value?: string) => {
          if (!value) return ''
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
          return jalaliToGregorianDate(value)
        }
        const toJalaliInput = (value: string) => (value ? formatJalaliDate(value, 'yyyy/MM/dd') : '')
        const birthDateEn = normalizeDateEn(loaded.birthDateEn || loaded.birthDate)
        const martyrdomDateEn = normalizeDateEn(loaded.martyrdomDateEn || loaded.martyrdomDate)
        setForm({
          title: loaded.title || '',
          titleEn: loaded.titleEn || '',
          slug: loaded.slug || '',
          excerpt: loaded.excerpt || '',
          excerptEn: loaded.excerptEn || '',
          content: loaded.content || '',
          contentEn: loaded.contentEn || loaded.biographyEn || '',
          status: loaded.status || 'draft',
          categoryId: loaded.martyrCategory?.id || '',
          featuredImage: loaded.featuredImage || '',
          rank: loaded.rank || '',
          rankEn: loaded.rankEn || '',
          unit: loaded.unit || '',
          unitId: loaded.martyrUnitId || '',
          unitEn: loaded.unitEn || '',
          birthDate: toJalaliInput(birthDateEn),
          birthDateEn,
          martyrdomDate: toJalaliInput(martyrdomDateEn),
          martyrdomDateEn,
          birthPlace: loaded.birthPlace || '',
          birthPlaceEn: loaded.birthPlaceEn || '',
          martyrdomPlace: loaded.martyrdomPlace || '',
          martyrdomPlaceEn: loaded.martyrdomPlaceEn || '',
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
    return isNew ? 'ثبت پرونده جدید شهدا' : 'ویرایش اطلاعات شهدا'
  }, [isNew, lastSavedAt, saveState])

  const persist = async (nextStatus?: ContentStatus) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('نام و بیوگرافی اصلی الزامی هستند')
      return
    }

    setIsSaving(true)
    setSaveState('saving')

    try {
      if (form.birthDateEn && form.martyrdomDateEn && form.birthDateEn > form.martyrdomDateEn) {
        toast.error('تاریخ شهادت باید پس از تاریخ تولد باشد')
        setIsSaving(false)
        setSaveState('error')
        return
      }

      const selectedCategory = categories.find((cat) => cat.id === form.categoryId)
      const payload: Partial<Martyr> = {
        title: form.title.trim(),
        titleEn: form.titleEn.trim() || undefined,
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim() || undefined,
        excerptEn: form.excerptEn.trim() || undefined,
        content: form.content,
        contentEn: form.contentEn.trim() || undefined,
        biography: form.content,
        biographyEn: form.contentEn.trim() || undefined,
        status: nextStatus || form.status,
        featuredImage: form.featuredImage || undefined,
        martyrCategory: selectedCategory
          ? {
              id: selectedCategory.id,
              name: selectedCategory.name,
              slug: selectedCategory.name.replace(/\s+/g, '-'),
              order: 0,
              martyrCount: 0,
            }
          : undefined,
        rank: form.rank || undefined,
        rankEn: form.rankEn || undefined,
        unit: form.unit || undefined,
        martyrUnitId: form.unitId || undefined,
        unitEn: form.unitEn || undefined,
        birthDate: form.birthDateEn || undefined,
        birthDateEn: form.birthDateEn || undefined,
        martyrdomDate: form.martyrdomDateEn || undefined,
        martyrdomDateEn: form.martyrdomDateEn || undefined,
        birthPlace: form.birthPlace || undefined,
        birthPlaceEn: form.birthPlaceEn || undefined,
        martyrdomPlace: form.martyrdomPlace || undefined,
        martyrdomPlaceEn: form.martyrdomPlaceEn || undefined,
        isFeatured: form.isFeatured,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
        metaTitle: form.metaTitle || undefined,
        metaTitleEn: form.metaTitleEn || undefined,
        metaDescription: form.metaDescription || undefined,
        metaDescriptionEn: form.metaDescriptionEn || undefined,
        canonicalUrl: form.canonicalUrl || undefined,
      }

      const saved = isNew ? await martyrsApi.create(payload) : await martyrsApi.update(id, payload)
      setItem(saved)
      setForm((prev) => ({ ...prev, status: saved.status }))
      setIsDirty(false)
      setLastSavedAt(new Date())
      setSaveState('saved')
      if (saveStateTimer.current) clearTimeout(saveStateTimer.current)
      saveStateTimer.current = setTimeout(() => setSaveState('idle'), 2500)

      if (isNew) router.replace(`/dashboard/martyrs/${saved.id}`)
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
    if (key === 'birthDate') {
      const gregorian = jalaliToGregorianDate(String(value))
      setForm((prev) => ({ ...prev, birthDate: String(value), birthDateEn: gregorian }))
      setIsDirty(true)
      return
    }
    if (key === 'martyrdomDate') {
      const gregorian = jalaliToGregorianDate(String(value))
      setForm((prev) => ({ ...prev, martyrdomDate: String(value), martyrdomDateEn: gregorian }))
      setIsDirty(true)
      return
    }
    setForm((prev) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const updateStatus = async (status: ContentStatus) => {
    if (status === 'published' && !window.confirm('آیا مطمئن هستید که این اطلاعات تأیید شده‌اند؟')) return
    if (isNew) {
      await persist(status)
      return
    }
    try {
      const updated = await martyrsApi.updateStatus(id, status)
      setItem(updated)
      setForm((prev) => ({ ...prev, status }))
      toast.success('وضعیت با موفقیت به‌روزرسانی شد')
    } catch {
      toast.error('تغییر وضعیت انجام نشد')
    }
  }

  const uploadProfileImage = async (file?: File) => {
    if (!file) return
    try {
      const uploaded = await mediaApi.uploadImage(file)
      setField('featuredImage', uploaded)
      toast.success('تصویر پروفایل آپلود شد')
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
      title={isNew ? 'شهید جدید' : 'ویرایش پرونده شهید'}
      subtitle={subtitle}
      onBack={() => router.push('/dashboard/martyrs')}
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
            icon={Heart}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="martyr-featured">نمایش ویژه</Label>
              <Switch id="martyr-featured" checked={form.isFeatured} onCheckedChange={(checked) => setField('isFeatured', checked)} />
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
            placeholder="نام کامل شهید..."
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
                  <SelectValue placeholder="انتخاب دسته‌بندی" />
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
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">رتبه / عنوان</Label>
              <Input value={form.rank} onChange={(e) => setField('rank', e.target.value)} />
            </div>
            <div>
              <Label className="text-small">یگان</Label>
              <Select
                value={form.unitId}
                onValueChange={(value) => {
                  const selected = units.find((item) => item.id === value)
                  setField('unitId', value)
                  setField('unit', selected?.name || '')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب یگان" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">تاریخ تولد</Label>
              <Input value={form.birthDate} onChange={(e) => setField('birthDate', e.target.value)} placeholder="مثال: ۱۳۶۵/۰۴/۱۸" />
            </div>
            <div>
              <Label className="text-small">تاریخ شهادت</Label>
              <Input value={form.martyrdomDate} onChange={(e) => setField('martyrdomDate', e.target.value)} placeholder="مثال: ۱۴۰۰/۰۳/۰۱" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">محل تولد</Label>
              <Input value={form.birthPlace} onChange={(e) => setField('birthPlace', e.target.value)} />
            </div>
            <div>
              <Label className="text-small">محل شهادت</Label>
              <Input value={form.martyrdomPlace} onChange={(e) => setField('martyrdomPlace', e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-small">بیوگرافی کوتاه</Label>
            <Textarea rows={3} value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} />
          </div>
          <div>
            <Label className="text-small">تصویر پرتره</Label>
            <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void uploadProfileImage(e.target.files?.[0])} />
            {form.featuredImage ? <img src={form.featuredImage} alt="profile" className="mt-3 h-48 w-40 rounded-[var(--radius-md)] object-cover" /> : null}
          </div>
          <RichTextEditor content={form.content} onChange={(value) => setField('content', value)} placeholder="بیوگرافی کامل..." />
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
            <Label className="text-small">نام انگلیسی</Label>
            <Input value={form.titleEn} onChange={(e) => setField('titleEn', e.target.value)} />
          </div>
          <div>
            <Label className="text-small">خلاصه انگلیسی</Label>
            <Textarea rows={3} value={form.excerptEn} onChange={(e) => setField('excerptEn', e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">رتبه / عنوان انگلیسی</Label>
              <Input value={form.rankEn} onChange={(e) => setField('rankEn', e.target.value)} />
            </div>
            <div>
              <Label className="text-small">یگان انگلیسی</Label>
              <Input value={form.unitEn} onChange={(e) => setField('unitEn', e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">تاریخ تولد میلادی (خودکار)</Label>
              <Input value={form.birthDateEn} readOnly placeholder="YYYY-MM-DD" />
            </div>
            <div>
              <Label className="text-small">تاریخ شهادت میلادی (خودکار)</Label>
              <Input value={form.martyrdomDateEn} readOnly placeholder="YYYY-MM-DD" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">محل تولد انگلیسی</Label>
              <Input value={form.birthPlaceEn} onChange={(e) => setField('birthPlaceEn', e.target.value)} />
            </div>
            <div>
              <Label className="text-small">محل شهادت انگلیسی</Label>
              <Input value={form.martyrdomPlaceEn} onChange={(e) => setField('martyrdomPlaceEn', e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-small">بیوگرافی انگلیسی</Label>
            <RichTextEditor content={form.contentEn} onChange={(value) => setField('contentEn', value)} placeholder="English biography..." />
          </div>
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
