'use client'

import { use, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Check, FlaskConical, Save, Send, Settings2, ShieldCheck } from 'lucide-react'
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
import { mediaApi, weaponsApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDateTime } from '@/lib/utils/date'
import { toast } from 'sonner'
import type { ContentStatus, Weapon } from '@/lib/types'

const RichTextEditor = dynamic(
  () => import('@/components/editor/rich-text-editor').then((module) => module.RichTextEditor),
  { ssr: false, loading: () => <div className="h-[320px] animate-pulse rounded-[var(--radius-lg)] border border-border bg-muted" /> },
)

type SpecRow = {
  id: string
  key: string
  keyEn: string
  keyTranslation: string
  value: string
  valueEn: string
  unit: string
  unitTranslation: string
  isPublic: boolean
}

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 80 }, (_, index) => currentYear - index)

const statusOptions: { label: string; value: ContentStatus }[] = [
  { label: 'پیش‌نویس', value: 'draft' },
  { label: 'در انتظار بررسی', value: 'pending_review' },
  { label: 'منتشرشده', value: 'published' },
  { label: 'بایگانی', value: 'archived' },
]

export default function ArsenalEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const isNew = id === 'new'
  const router = useRouter()
  const { canPublish } = usePermission('arsenal')

  const [item, setItem] = useState<Weapon | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
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
    typeLabelFa: '',
    typeLabelEn: '',
    rangeKm: '',
    manufacturer: '',
    manufacturerEn: '',
    countryOfOrigin: '',
    countryOfOriginEn: '',
    yearIntroduced: '',
    isOperational: true,
    isFeatured: false,
    publishedAt: '',
    metaTitle: '',
    metaTitleEn: '',
    metaDescription: '',
    metaDescriptionEn: '',
    canonicalUrl: '',
  })
  const [specRows, setSpecRows] = useState<SpecRow[]>([])
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null)
  const saveStateTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, loaded] = await Promise.all([
          weaponsApi.getCategories(),
          isNew ? Promise.resolve(null) : weaponsApi.getById(id),
        ])
        setCategories(cats.map((cat) => ({ id: cat.id, name: cat.name })))
        if (!loaded) return

        setItem(loaded)
        setForm({
          title: loaded.title || '',
          titleEn: loaded.titleEn || '',
          slug: loaded.slug || '',
          excerpt: loaded.excerpt || '',
          excerptEn: loaded.excerptEn || '',
          content: loaded.content || '',
          contentEn: loaded.contentEn || '',
          status: loaded.status || 'draft',
          categoryId: loaded.weaponCategory?.id || '',
          featuredImage: loaded.featuredImage || '',
          typeLabelFa: loaded.weaponType || loaded.weaponCategory?.name || '',
          typeLabelEn: loaded.weaponTypeEn || '',
          rangeKm: loaded.specifications?.['برد']?.replace(/[^\d.]/g, '') || '',
          manufacturer: loaded.manufacturer || '',
          manufacturerEn: loaded.manufacturerEn || '',
          countryOfOrigin: loaded.countryOfOrigin || '',
          countryOfOriginEn: loaded.countryOfOriginEn || '',
          yearIntroduced: loaded.yearIntroduced ? String(loaded.yearIntroduced) : '',
          isOperational: loaded.isOperational ?? true,
          isFeatured: loaded.isFeatured ?? false,
          publishedAt: loaded.publishedAt?.slice(0, 16) || '',
          metaTitle: loaded.metaTitle || '',
          metaTitleEn: loaded.metaTitleEn || '',
          metaDescription: loaded.metaDescription || '',
          metaDescriptionEn: loaded.metaDescriptionEn || '',
          canonicalUrl: loaded.canonicalUrl || '',
        })
        const specsFa = loaded.specifications || {}
        const specsEn = loaded.specificationsEn || {}
        const specKeys = Array.from(new Set([...Object.keys(specsFa), ...Object.keys(specsEn)]))
        setSpecRows(
          specKeys.map((key, index) => ({
            id: `${index}`,
            key,
            keyEn: key,
            keyTranslation: '',
            value: specsFa[key] || '',
            valueEn: specsEn[key] || '',
            unit: '',
            unitTranslation: '',
            isPublic: true,
          })),
        )
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
    return isNew ? 'ثبت آیتم جدید تسلیحات' : 'ویرایش اطلاعات تسلیحات'
  }, [isNew, lastSavedAt, saveState])

  const persist = async (nextStatus?: ContentStatus) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('عنوان و محتوای اصلی الزامی هستند')
      return
    }

    setIsSaving(true)
    setSaveState('saving')

    try {
      const selectedCategory = categories.find((cat) => cat.id === form.categoryId)
      const payload: Partial<Weapon> = {
        title: form.title.trim(),
        titleEn: form.titleEn.trim() || undefined,
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim() || undefined,
        excerptEn: form.excerptEn.trim() || undefined,
        content: form.content,
        contentEn: form.contentEn.trim() || undefined,
        status: nextStatus || form.status,
        featuredImage: form.featuredImage || undefined,
        weaponType: form.typeLabelFa.trim() || undefined,
        weaponTypeEn: form.typeLabelEn.trim() || undefined,
        weaponCategory: selectedCategory
          ? {
              id: selectedCategory.id,
              name: selectedCategory.name,
              slug: selectedCategory.name.replace(/\s+/g, '-'),
              order: 0,
              weaponCount: 0,
            }
          : undefined,
        manufacturer: form.manufacturer || undefined,
        manufacturerEn: form.manufacturerEn || undefined,
        countryOfOrigin: form.countryOfOrigin || undefined,
        countryOfOriginEn: form.countryOfOriginEn || undefined,
        yearIntroduced: form.yearIntroduced ? Number(form.yearIntroduced) : undefined,
        isOperational: form.isOperational,
        isFeatured: form.isFeatured,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
        metaTitle: form.metaTitle || undefined,
        metaTitleEn: form.metaTitleEn || undefined,
        metaDescription: form.metaDescription || undefined,
        metaDescriptionEn: form.metaDescriptionEn || undefined,
        canonicalUrl: form.canonicalUrl || undefined,
        specifications: specRows.reduce<Record<string, string>>((acc, row) => {
          if (row.key.trim() && row.value.trim()) {
            acc[row.key.trim()] = row.unit.trim() ? `${row.value.trim()} ${row.unit.trim()}` : row.value.trim()
          }
          return acc
        }, {}),
        specificationsEn: specRows.reduce<Record<string, string>>((acc, row) => {
          const effectiveKey = row.keyEn.trim() || row.key.trim()
          if (effectiveKey && row.valueEn.trim()) {
            acc[effectiveKey] = row.unit.trim() ? `${row.valueEn.trim()} ${row.unit.trim()}` : row.valueEn.trim()
          }
          return acc
        }, {}),
        specificationsTranslations: specRows.reduce<Record<string, string>>((acc, row) => {
          if (row.key.trim() && row.keyTranslation.trim()) {
            acc[row.key.trim()] = row.keyTranslation.trim()
          }
          return acc
        }, {}),
        specificationsUnitTranslations: specRows.reduce<Record<string, string>>((acc, row) => {
          if (row.key.trim() && row.unitTranslation.trim()) {
            acc[row.key.trim()] = row.unitTranslation.trim()
          }
          return acc
        }, {}),
      }

      const saved = isNew ? await weaponsApi.create(payload) : await weaponsApi.update(id, payload)
      setItem(saved)
      setForm((prev) => ({ ...prev, status: saved.status }))
      setIsDirty(false)
      setLastSavedAt(new Date())
      setSaveState('saved')
      if (saveStateTimer.current) clearTimeout(saveStateTimer.current)
      saveStateTimer.current = setTimeout(() => setSaveState('idle'), 2500)

      if (isNew) {
        router.replace(`/dashboard/arsenal/${saved.id}`)
      }
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
    setForm((prev) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const addSpecRow = () => {
    setSpecRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: '', keyEn: '', keyTranslation: '', value: '', valueEn: '', unit: '', unitTranslation: '', isPublic: true },
    ])
    setIsDirty(true)
  }

  const updateSpecRow = (rowId: string, changes: Partial<SpecRow>) => {
    setSpecRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, ...changes } : row)))
    setIsDirty(true)
  }

  const removeSpecRow = (rowId: string) => {
    setSpecRows((prev) => prev.filter((row) => row.id !== rowId))
    setIsDirty(true)
  }

  const updateStatus = async (status: ContentStatus) => {
    if (isNew) {
      await persist(status)
      return
    }
    try {
      const updated = await weaponsApi.updateStatus(id, status)
      setItem(updated)
      setForm((prev) => ({ ...prev, status }))
      toast.success('وضعیت با موفقیت به‌روزرسانی شد')
    } catch {
      toast.error('تغییر وضعیت انجام نشد')
    }
  }

  const uploadFeaturedImage = async (file?: File) => {
    if (!file) return
    try {
      const uploaded = await mediaApi.uploadImage(file)
      setField('featuredImage', uploaded)
      toast.success('تصویر شاخص آپلود شد')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'آپلود تصویر ناموفق بود')
    }
  }

  if (isLoading) {
    return <div className="h-[600px] animate-pulse rounded-[var(--radius-lg)] bg-muted" />
  }

  const historyRows = [
    { label: 'ایجاد', at: item?.createdAt },
    { label: 'ویرایش', at: item?.updatedAt },
    { label: 'انتشار', at: item?.publishedAt },
  ].filter((entry) => entry.at)

  return (
    <EditorShell
      title={isNew ? 'تسلیحات جدید' : 'ویرایش تسلیحات'}
      subtitle={subtitle}
      onBack={() => router.push('/dashboard/arsenal')}
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
            icon={ShieldCheck}
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
                <Input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => setField('publishedAt', e.target.value)}
                />
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
              <div className="flex items-center justify-between">
                <Label htmlFor="weapon-featured">نمایش ویژه</Label>
                <Switch
                  id="weapon-featured"
                  checked={form.isFeatured}
                  onCheckedChange={(checked) => setField('isFeatured', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="weapon-operational">عملیاتی</Label>
                <Switch
                  id="weapon-operational"
                  checked={form.isOperational}
                  onCheckedChange={(checked) => setField('isOperational', checked)}
                />
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
          <TabsTrigger value="specs">مشخصات فنی</TabsTrigger>
          <TabsTrigger value="seo">سئو</TabsTrigger>
          <TabsTrigger value="translations">ترجمه‌ها</TabsTrigger>
          <TabsTrigger value="history">تاریخچه</TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-4">
          <Input
            placeholder="نام سلاح یا سامانه را وارد کنید..."
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
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-small">نوع سلاح</Label>
              <Input value={form.typeLabelFa} onChange={(e) => setField('typeLabelFa', e.target.value)} placeholder="مثلاً موشک کروز" />
            </div>
            <div>
              <Label className="text-small">برد (کیلومتر)</Label>
              <Input
                type="number"
                min={0}
                step="0.1"
                inputMode="decimal"
                value={form.rangeKm}
                onChange={(e) => setField('rangeKm', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-small">سال معرفی</Label>
              <Select value={form.yearIntroduced} onValueChange={(value) => setField('yearIntroduced', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب سال" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year.toLocaleString('fa-IR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">تولیدکننده</Label>
              <Input value={form.manufacturer} onChange={(e) => setField('manufacturer', e.target.value)} />
            </div>
            <div>
              <Label className="text-small">کشور سازنده</Label>
              <Input value={form.countryOfOrigin} onChange={(e) => setField('countryOfOrigin', e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-small">خلاصه</Label>
            <Textarea rows={3} value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} />
          </div>
          <div>
            <Label className="text-small">تصویر شاخص</Label>
            <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void uploadFeaturedImage(e.target.files?.[0])} />
            {form.featuredImage ? (
              <img src={form.featuredImage} alt="cover" className="mt-3 h-40 w-full rounded-[var(--radius-md)] object-cover" />
            ) : null}
          </div>
          <RichTextEditor
            content={form.content}
            onChange={(value) => setField('content', value)}
            placeholder="توضیحات کامل تسلیحات را وارد کنید..."
          />
        </TabsContent>

        <TabsContent value="specs" className="space-y-4">
          <div className="rounded-[var(--radius-md)] border border-border">
            <div className="grid grid-cols-12 gap-2 border-b border-border px-3 py-2 text-small text-muted-foreground">
              <span className="col-span-2">کلید</span>
              <span className="col-span-2">ترجمه کلید</span>
              <span className="col-span-3">مقدار</span>
              <span className="col-span-1">واحد</span>
              <span className="col-span-1">ترجمه واحد</span>
              <span className="col-span-2">نمایش عمومی</span>
              <span className="col-span-1">حذف</span>
            </div>
            <div className="space-y-2 p-3">
              {specRows.map((row) => (
                <div key={row.id} className="grid grid-cols-12 gap-2">
                  <Input className="col-span-2" value={row.key} onChange={(e) => updateSpecRow(row.id, { key: e.target.value })} />
                  <Input className="col-span-2" value={row.keyTranslation} onChange={(e) => updateSpecRow(row.id, { keyTranslation: e.target.value })} placeholder="Key translation" />
                  <Input className="col-span-3" value={row.value} onChange={(e) => updateSpecRow(row.id, { value: e.target.value })} />
                  <Input className="col-span-1" value={row.unit} onChange={(e) => updateSpecRow(row.id, { unit: e.target.value })} />
                  <Input className="col-span-1" value={row.unitTranslation} onChange={(e) => updateSpecRow(row.id, { unitTranslation: e.target.value })} placeholder="Unit trans." />
                  <div className="col-span-2 flex items-center justify-center">
                    <Switch checked={row.isPublic} onCheckedChange={(checked) => updateSpecRow(row.id, { isPublic: checked })} />
                  </div>
                  <Button variant="ghost" className="col-span-1" onClick={() => removeSpecRow(row.id)}>
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Button variant="outline" onClick={addSpecRow}>
            <FlaskConical className="me-1 size-4" />
            افزودن مشخصه
          </Button>
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
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-small">نوع سلاح انگلیسی</Label>
              <Input value={form.typeLabelEn} onChange={(e) => setField('typeLabelEn', e.target.value)} />
            </div>
            <div>
              <Label className="text-small">تولیدکننده انگلیسی</Label>
              <Input value={form.manufacturerEn} onChange={(e) => setField('manufacturerEn', e.target.value)} />
            </div>
            <div>
              <Label className="text-small">کشور سازنده انگلیسی</Label>
              <Input value={form.countryOfOriginEn} onChange={(e) => setField('countryOfOriginEn', e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-small">خلاصه انگلیسی</Label>
            <Textarea rows={3} value={form.excerptEn} onChange={(e) => setField('excerptEn', e.target.value)} />
          </div>
          <div className="rounded-[var(--radius-md)] border border-border">
            <div className="grid grid-cols-12 gap-2 border-b border-border px-3 py-2 text-small text-muted-foreground">
              <span className="col-span-4">کلید انگلیسی مشخصه</span>
              <span className="col-span-8">مقدار انگلیسی مشخصه</span>
            </div>
            <div className="space-y-2 p-3">
              {specRows.map((row) => (
                <div key={`${row.id}-en`} className="grid grid-cols-12 gap-2">
                  <Input
                    className="col-span-4"
                    value={row.keyEn}
                    onChange={(e) => updateSpecRow(row.id, { keyEn: e.target.value })}
                    placeholder="English spec key"
                  />
                  <Input
                    className="col-span-8"
                    value={row.valueEn}
                    onChange={(e) => updateSpecRow(row.id, { valueEn: e.target.value })}
                    placeholder="English spec value"
                  />
                </div>
              ))}
            </div>
          </div>
          <RichTextEditor content={form.contentEn} onChange={(value) => setField('contentEn', value)} placeholder="English description..." />
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {historyRows.length === 0 ? (
            <p className="text-small text-muted-foreground">تاریخچه‌ای ثبت نشده است.</p>
          ) : (
            historyRows.map((row, index) => (
              <div key={index} className="flex items-start gap-2 text-small">
                <span className="mt-2 size-2 rounded-full bg-primary" />
                <p>
                  {row.label}: {row.at ? formatJalaliDateTime(row.at) : '—'}
                </p>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </EditorShell>
  )
}
