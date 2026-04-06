'use client'

import { use, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Check, FileText, Save, Send, Settings2 } from 'lucide-react'
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
import { documentsApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDateTime } from '@/lib/utils/date'
import { toast } from 'sonner'
import type { ContentStatus, Document } from '@/lib/types'

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

export default function DocumentEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const isNew = id === 'new'
  const router = useRouter()
  const { canPublish } = usePermission('documents')

  const [item, setItem] = useState<Document | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [documentTypes, setDocumentTypes] = useState<{ id: string; code: string; name: string }[]>([])
  const [documentFiles, setDocumentFiles] = useState<
    Array<{ id: string; name: string; size: string; role: 'primary' | 'subtitle' | 'preview' | 'attachment'; language?: string; isPrimary: boolean }>
  >([])
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState('main')
  const [openPanels, setOpenPanels] = useState({
    publish: true,
    access: true,
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
    fileUrl: '',
    fileType: '',
    documentTypeId: '',
    isConfidential: false,
    confidentialityLevel: 'public' as NonNullable<Document['confidentialityLevel']>,
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
        const [cats, types, loaded] = await Promise.all([
          documentsApi.getCategories(),
          documentsApi.getDocumentTypes(),
          isNew ? Promise.resolve(null) : documentsApi.getById(id),
        ])
        setCategories(cats.map((cat) => ({ id: cat.id, name: cat.name })))
        setDocumentTypes(types.map((item) => ({ id: item.id, code: item.code, name: item.name })))
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
          categoryId: loaded.documentCategory?.id || '',
          fileUrl: loaded.fileUrl || '',
          fileType: loaded.fileType || '',
          documentTypeId: '',
          isConfidential: loaded.isConfidential ?? false,
          confidentialityLevel: loaded.confidentialityLevel || 'public',
          publishedAt: loaded.publishedAt?.slice(0, 16) || '',
          metaTitle: loaded.metaTitle || '',
          metaTitleEn: loaded.metaTitleEn || '',
          metaDescription: loaded.metaDescription || '',
          metaDescriptionEn: loaded.metaDescriptionEn || '',
          canonicalUrl: loaded.canonicalUrl || '',
        })
        if (loaded.fileUrl) {
          setDocumentFiles([
            {
              id: 'existing-1',
              name: loaded.fileUrl.split('/').pop() || 'file',
              size: loaded.fileSize ? `${(loaded.fileSize / (1024 * 1024)).toFixed(1)} MB` : '—',
              role: 'primary',
              isPrimary: true,
            },
          ])
        }
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
    return isNew ? 'ثبت سند جدید' : 'ویرایش اطلاعات سند'
  }, [isNew, lastSavedAt, saveState])

  const persist = async (nextStatus?: ContentStatus) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('عنوان و محتوای سند الزامی است')
      return
    }

    setIsSaving(true)
    setSaveState('saving')
    try {
      const selectedCategory = categories.find((cat) => cat.id === form.categoryId)
      const payload: Partial<Document> = {
        title: form.title.trim(),
        titleEn: form.titleEn.trim() || undefined,
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim() || undefined,
        excerptEn: form.excerptEn.trim() || undefined,
        content: form.content,
        contentEn: form.contentEn.trim() || undefined,
        status: nextStatus || form.status,
        documentCategory: selectedCategory
          ? {
              id: selectedCategory.id,
              name: selectedCategory.name,
              slug: selectedCategory.name.replace(/\s+/g, '-'),
              order: 0,
              documentCount: 0,
            }
          : undefined,
        fileUrl: form.fileUrl || undefined,
        fileType: form.fileType || undefined,
        ...(form.documentTypeId ? { documentTypeId: form.documentTypeId } : {}),
        isConfidential: form.isConfidential,
        confidentialityLevel: form.confidentialityLevel,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
        metaTitle: form.metaTitle || undefined,
        metaTitleEn: form.metaTitleEn || undefined,
        metaDescription: form.metaDescription || undefined,
        metaDescriptionEn: form.metaDescriptionEn || undefined,
        canonicalUrl: form.canonicalUrl || undefined,
      }

      const saved = isNew ? await documentsApi.create(payload) : await documentsApi.update(id, payload)
      setItem(saved)
      setForm((prev) => ({ ...prev, status: saved.status }))
      setIsDirty(false)
      setLastSavedAt(new Date())
      setSaveState('saved')
      if (saveStateTimer.current) clearTimeout(saveStateTimer.current)
      saveStateTimer.current = setTimeout(() => setSaveState('idle'), 2500)
      if (isNew) router.replace(`/dashboard/documents/${saved.id}`)
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

  const addFile = (file?: File) => {
    if (!file) return
    const allowed = [
      'application/pdf',
      'video/mp4',
      'audio/mpeg',
      'application/zip',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowed.includes(file.type)) {
      toast.error('فرمت فایل مجاز نیست (PDF/MP4/MP3/ZIP/DOCX)')
      return
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error('حداکثر حجم فایل ۵۰۰ مگابایت است')
      return
    }
    const sizeMb = `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    setDocumentFiles((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: file.name,
        size: sizeMb,
        role: prev.length === 0 ? 'primary' : 'attachment',
        isPrimary: prev.length === 0,
      },
    ])
  }

  const updateFileRole = (id: string, role: 'primary' | 'subtitle' | 'preview' | 'attachment') => {
    setDocumentFiles((prev) =>
      prev.map((item) => {
        if (role === 'primary') {
          return { ...item, role: item.id === id ? 'primary' : item.role, isPrimary: item.id === id }
        }
        return item.id === id ? { ...item, role, isPrimary: false } : item
      }),
    )
  }

  const updateStatus = async (status: ContentStatus) => {
    if (isNew) {
      await persist(status)
      return
    }
    try {
      const updated = await documentsApi.updateStatus(id, status)
      setItem(updated)
      setForm((prev) => ({ ...prev, status }))
      toast.success('وضعیت با موفقیت به‌روزرسانی شد')
    } catch {
      toast.error('تغییر وضعیت انجام نشد')
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
      title={isNew ? 'سند جدید' : 'ویرایش سند'}
      subtitle={subtitle}
      onBack={() => router.push('/dashboard/documents')}
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
            icon={FileText}
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
            title="سطح دسترسی"
            icon={Settings2}
            open={openPanels.access}
            onOpenChange={() => setOpenPanels((prev) => ({ ...prev, access: !prev.access }))}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="doc-confidential">محرمانه</Label>
                <Switch id="doc-confidential" checked={form.isConfidential} onCheckedChange={(checked) => setField('isConfidential', checked)} />
              </div>
              <div>
                <Label className="text-small">سطح محرمانگی</Label>
                <Select
                  value={form.confidentialityLevel}
                  onValueChange={(value: NonNullable<Document['confidentialityLevel']>) =>
                    setField('confidentialityLevel', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">عمومی</SelectItem>
                    <SelectItem value="internal">داخلی</SelectItem>
                    <SelectItem value="confidential">محرمانه</SelectItem>
                    <SelectItem value="secret">سری</SelectItem>
                  </SelectContent>
                </Select>
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
              <p>دانلود: {(item?.downloadCount || 0).toLocaleString('fa-IR')}</p>
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
          <TabsTrigger value="files">فایل‌ها</TabsTrigger>
          <TabsTrigger value="seo">سئو</TabsTrigger>
          <TabsTrigger value="translations">ترجمه‌ها</TabsTrigger>
          <TabsTrigger value="history">تاریخچه</TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-4">
          <Input
            placeholder="عنوان سند..."
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
              <Label className="text-small">دسته سند</Label>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-small">لینک فایل</Label>
              <Input value={form.fileUrl} onChange={(e) => setField('fileUrl', e.target.value)} placeholder="/documents/file.pdf یا https://..." />
            </div>
            <div>
              <Label className="text-small">نوع فایل</Label>
              <Input value={form.fileType} onChange={(e) => setField('fileType', e.target.value)} placeholder="application/pdf" />
            </div>
          </div>
          <div>
            <Label className="text-small">نوع مستند</Label>
            <Select value={form.documentTypeId} onValueChange={(value) => setField('documentTypeId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب نوع مستند" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-small">خلاصه</Label>
            <Textarea rows={3} value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} />
          </div>
          <RichTextEditor content={form.content} onChange={(value) => setField('content', value)} placeholder="متن کامل سند..." />
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <div className="rounded-[var(--radius-md)] border-2 border-dashed border-border p-4 text-center">
            <Label className="mb-2 block text-small">آپلود فایل جدید (PDF/MP4/MP3/ZIP/DOCX)</Label>
            <Input type="file" onChange={(e) => addFile(e.target.files?.[0])} />
          </div>
          <div className="space-y-3">
            {documentFiles.length === 0 ? (
              <p className="text-small text-muted-foreground">فایلی آپلود نشده است.</p>
            ) : (
              documentFiles.map((fileItem) => (
                <div key={fileItem.id} className="rounded-[var(--radius-md)] border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-small font-medium">{fileItem.name}</p>
                      <p className="text-caption text-muted-foreground">{fileItem.size}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDocumentFiles((prev) => prev.filter((item) => item.id !== fileItem.id))}
                    >
                      حذف
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <div>
                      <Label className="text-small">نقش فایل</Label>
                      <Select value={fileItem.role} onValueChange={(value: 'primary' | 'subtitle' | 'preview' | 'attachment') => updateFileRole(fileItem.id, value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">اصلی</SelectItem>
                          <SelectItem value="subtitle">زیرنویس</SelectItem>
                          <SelectItem value="preview">پیش‌نمایش</SelectItem>
                          <SelectItem value="attachment">پیوست</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-small">زبان</Label>
                      <Select
                        value={fileItem.language || 'fa'}
                        onValueChange={(value) =>
                          setDocumentFiles((prev) => prev.map((item) => (item.id === fileItem.id ? { ...item, language: value } : item)))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fa">فارسی</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2">
                      <Label className="text-small">فایل اصلی</Label>
                      <Switch
                        checked={fileItem.isPrimary}
                        onCheckedChange={(checked) => {
                          if (!checked) return
                          updateFileRole(fileItem.id, 'primary')
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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
