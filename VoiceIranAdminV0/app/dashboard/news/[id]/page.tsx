'use client'

import { use, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRight,
  Check,
  Clock,
  Image as ImageIcon,
  Layers,
  Settings,
  History,
  Save,
  Send,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/ui/status-badge'
import { categoriesApi, postsApi, tagsApi } from '@/lib/api/api-client'
import { usersApi } from '@/lib/api/api-client'
import { useAuthStore } from '@/lib/store/auth-store'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDateTime } from '@/lib/utils/date'
import { toast } from 'sonner'
import type { Category, ContentStatus, Post, Tag, User } from '@/lib/types'

const editorSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(200),
  titleEn: z.string().optional(),
  excerpt: z.string().optional(),
  summary: z.string().optional(),
  excerptEn: z.string().optional(),
  content: z.string().min(1, 'محتوا الزامی است'),
  contentEn: z.string().optional(),
  slug: z.string().optional(),
  metaTitle: z.string().optional(),
  metaTitleEn: z.string().optional(),
  metaDescription: z.string().optional(),
  metaDescriptionEn: z.string().optional(),
  canonicalUrl: z.string().optional(),
  readingTimeMinutes: z.coerce.number().min(1).max(60).default(5),
  authorId: z.string().optional(),
  isLive: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
})

type EditorFormData = z.infer<typeof editorSchema>

const RichTextEditor = dynamic(
  () => import('@/components/editor/rich-text-editor').then((module) => module.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="h-[360px] animate-pulse rounded-[var(--radius-lg)] border border-border bg-muted" />,
  },
)

export default function NewsEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const isNew = id === 'new'

  const router = useRouter()
  const { user } = useAuthStore()
  const { role } = usePermission('news')

  const [post, setPost] = useState<Post | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [authors, setAuthors] = useState<User[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [scheduledEnabled, setScheduledEnabled] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [rejectionComment, setRejectionComment] = useState('')
  const [imageError, setImageError] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [slugState, setSlugState] = useState<'idle' | 'checking' | 'valid' | 'duplicate'>('idle')
  const [activeLangTab, setActiveLangTab] = useState<'fa' | 'en'>('fa')
  const [openPanels, setOpenPanels] = useState({
    status: true,
    image: true,
    taxonomy: true,
    seo: false,
    history: false,
  })

  const autosaveTimer = useRef<NodeJS.Timeout | null>(null)
  const saveStateTimer = useRef<NodeJS.Timeout | null>(null)
  const featuredImageInputRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditorFormData>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      title: '',
      titleEn: '',
      excerpt: '',
      excerptEn: '',
      content: '',
      contentEn: '',
      slug: '',
      metaTitle: '',
      metaTitleEn: '',
      metaDescription: '',
      metaDescriptionEn: '',
      canonicalUrl: '',
      readingTimeMinutes: 5,
      authorId: '',
      isLive: false,
      isFeatured: false,
    },
  })

  const watchedTitle = watch('title')
  const watchedTitleEn = watch('titleEn')
  const watchedExcerpt = watch('excerpt')
  const watchedSummary = watch('summary')
  const watchedExcerptEn = watch('excerptEn')
  const watchedContent = watch('content')
  const watchedContentEn = watch('contentEn')
  const watchedSlug = watch('slug')
  const watchedReadingTime = watch('readingTimeMinutes')
  const watchedIsLive = watch('isLive')
  const watchedIsFeatured = watch('isFeatured')
  const currentStatus: ContentStatus = post?.status || 'draft'

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearInterval(autosaveTimer.current)
      if (saveStateTimer.current) clearTimeout(saveStateTimer.current)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, tags, usersResponse] = await Promise.all([
          categoriesApi.getAll(),
          tagsApi.getAll(),
          usersApi.getAll({ page: 1, pageSize: 500 }),
        ])
        setCategories(cats)
        setAllTags(tags)
        setAuthors(usersResponse.data.filter((item) => item.isActive))

        if (!isNew) {
          const loaded = await postsApi.getById(id)
          if (!loaded) {
            toast.error('مطلب یافت نشد')
            router.replace('/dashboard/news')
            return
          }

          setPost(loaded)
          setFeaturedImage(loaded.featuredImage || '')
          setSelectedTags((loaded.tags || []).map((tag) => tag.id))
          setSelectedCategoryIds((loaded.categories || []).map((category) => category.id))
          setValue('title', loaded.title)
          setValue('titleEn', loaded.titleEn || '')
          setValue('excerpt', loaded.excerpt || '')
          setValue('summary', loaded.summary || '')
          setValue('excerptEn', loaded.excerptEn || '')
          setValue('content', loaded.content)
          setValue('contentEn', loaded.contentEn || '')
          setValue('slug', loaded.slug || '')
          setValue('metaTitle', loaded.metaTitle || '')
          setValue('metaTitleEn', loaded.metaTitleEn || '')
          setValue('metaDescription', loaded.metaDescription || '')
          setValue('metaDescriptionEn', loaded.metaDescriptionEn || '')
          setValue('canonicalUrl', loaded.canonicalUrl || '')
          setValue('readingTimeMinutes', loaded.readingTimeMinutes || 5)
          setValue('authorId', loaded.author?.id || '')
          setValue('isLive', Boolean(loaded.isLive))
          setValue('isFeatured', Boolean(loaded.isFeatured))
          setScheduledAt(loaded.scheduledAt ? loaded.scheduledAt.slice(0, 16) : '')
          setScheduledEnabled(Boolean(loaded.scheduledAt))
          setSlugState('valid')
        } else {
          setValue('authorId', user?.id || '')
          setSlugState('idle')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, isNew, router, setValue, user?.id])

  useEffect(() => {
    if (!isNew || !watchedTitle) return
    const slug = watchedTitle
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FFa-z0-9-]/g, '')
    setValue('slug', slug)
  }, [isNew, setValue, watchedTitle])

  useEffect(() => {
    if (!watchedSlug?.trim()) {
      setSlugState('idle')
      return
    }
    setSlugState('checking')
    const timer = setTimeout(async () => {
      const isUnique = await postsApi.checkSlugUnique(watchedSlug, isNew ? undefined : id)
      setSlugState(isUnique ? 'valid' : 'duplicate')
    }, 500)
    return () => clearTimeout(timer)
  }, [id, isNew, watchedSlug])

  const calculateReadingTime = () => {
    const plain = watchedContent.replace(/<[^>]+>/g, ' ').trim()
    const words = plain ? plain.split(/\s+/).length : 0
    const minutes = Math.min(60, Math.max(1, Math.ceil(words / 200)))
    setValue('readingTimeMinutes', minutes, { shouldDirty: true })
  }

  useEffect(() => {
    const unsaved = isDirty || saveState === 'saving'
    document.title = `${unsaved ? '• ' : ''}${isNew ? 'خبر جدید' : 'ویرایش خبر'}`

    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!unsaved) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [isDirty, isNew, saveState])

  const persist = async (payload: EditorFormData, status?: ContentStatus) => {
    const plainText = payload.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (plainText.length < 100) {
      toast.error('محتوا باید حداقل ۱۰۰ کاراکتر باشد')
      return
    }
    if (slugState === 'duplicate') {
      toast.error('نامک تکراری است. لطفاً نامک دیگری انتخاب کنید')
      return
    }
    setIsSaving(true)
    setSaveState('saving')

    try {
      const selectedAuthor = authors.find((author) => author.id === payload.authorId)
      const selectedCategories = categories.filter((cat) => selectedCategoryIds.includes(cat.id))
      const tags = allTags.filter((tag) => selectedTags.includes(tag.id))

      const contentPayload: Partial<Post> = {
        title: payload.title,
        titleEn: payload.titleEn || undefined,
        excerpt: payload.excerpt || undefined,
        summary: payload.summary || undefined,
        excerptEn: payload.excerptEn || undefined,
        content: payload.content,
        contentEn: payload.contentEn || undefined,
        slug: payload.slug || '',
        status: status || post?.status || 'draft',
        categories: selectedCategories,
        tags,
        author: selectedAuthor || post?.author || authors[0] || user || undefined,
        featuredImage: featuredImage || undefined,
        isLive: payload.isLive,
        isFeatured: payload.isFeatured,
        readingTimeMinutes: payload.readingTimeMinutes,
        metaTitle: payload.metaTitle || undefined,
        metaTitleEn: payload.metaTitleEn || undefined,
        metaDescription: payload.metaDescription || undefined,
        metaDescriptionEn: payload.metaDescriptionEn || undefined,
        canonicalUrl: payload.canonicalUrl || undefined,
        scheduledAt: scheduledEnabled && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      }

      if (isNew) {
        const created = await postsApi.create(contentPayload)
        setPost(created)
        toast.success('خبر با موفقیت ایجاد شد')
        router.replace(`/dashboard/news/${created.id}`)
      } else {
        const updated = await postsApi.update(id, contentPayload)
        setPost(updated)
      }

      setLastSavedAt(new Date())
      setSaveState('saved')
      if (saveStateTimer.current) clearTimeout(saveStateTimer.current)
      saveStateTimer.current = setTimeout(() => setSaveState('idle'), 3000)
    } catch {
      setSaveState('error')
      toast.error('ذخیره ناموفق بود. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (!isDirty) return
    if (autosaveTimer.current) clearInterval(autosaveTimer.current)

    autosaveTimer.current = setInterval(() => {
      const values = watch()
      if (!values.title?.trim()) return
      void persist(values)
    }, 30000)

    return () => {
      if (autosaveTimer.current) clearInterval(autosaveTimer.current)
    }
  }, [isDirty, watch])

  const runAction = handleSubmit(async (values) => {
    await persist(values)
  })

  const updateStatus = async (status: ContentStatus) => {
    if (isNew || !post) {
      await handleSubmit((values) => persist(values, status))()
      return
    }

    if (status === 'rejected' && rejectionComment.trim().length < 10) {
      toast.error('کامنت رد باید حداقل ۱۰ کاراکتر باشد')
      return
    }

    await postsApi.updateStatus(post.id, status, status === 'rejected' ? rejectionComment : undefined)
    const refreshed = await postsApi.getById(post.id)
    if (refreshed) setPost(refreshed)
    toast.success('وضعیت با موفقیت به‌روزرسانی شد')
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((idVal) => idVal !== tagId) : [...prev, tagId],
    )
  }

  const handleImageFile = (file?: File) => {
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setImageError('فرمت فایل مجاز نیست. فقط JPG، PNG یا WebP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('حجم فایل بیش از ۵ مگابایت است')
      return
    }

    setImageError('')
    const preview = URL.createObjectURL(file)
    setFeaturedImage(preview)
  }

  if (isLoading) {
    return <div className="h-[500px] animate-pulse rounded-[var(--radius-lg)] bg-muted" />
  }

  const canManage = role === 'superadmin' || role === 'content_manager'

  const historyItems = [
    { action: 'ایجاد محتوا', actor: user?.fullName || 'کاربر', date: post?.createdAt },
    { action: 'آخرین ویرایش', actor: user?.fullName || 'کاربر', date: post?.updatedAt },
    { action: 'انتشار', actor: user?.fullName || 'کاربر', date: post?.publishedAt },
  ].filter((entry) => entry.date)

  return (
    <div className="editor-rtl pb-10">
      <header className="sticky top-0 z-[180] flex min-h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/news')}>
            <ArrowRight className="size-5" />
          </Button>
          <div>
            <h2 className="text-base">{isNew ? 'خبر جدید' : 'ویرایش خبر'}</h2>
            <div className="text-caption text-muted-foreground">
              {saveState === 'saving' && 'در حال ذخیره...'}
              {saveState === 'saved' && lastSavedAt && `ذخیره شد — ${lastSavedAt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`}
              {saveState === 'error' && 'ذخیره ناموفق — تلاش مجدد'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isNew && <StatusBadge status={currentStatus} />}
          <Button variant="outline" onClick={runAction} disabled={isSaving}>
            <Save className="me-1 size-4" />
            ذخیره
          </Button>

          {(role === 'editor' || role === 'superadmin') && currentStatus === 'draft' && (
            <Button onClick={() => void updateStatus('pending_review')} disabled={isSaving}>
              <Send className="me-1 size-4" />
              ارسال برای بررسی
            </Button>
          )}

          {canManage && currentStatus === 'pending_review' && (
            <>
              <Button variant="destructive" onClick={() => void updateStatus('rejected')} disabled={isSaving}>
                <X className="me-1 size-4" />
                رد کردن
              </Button>
              <Button onClick={() => void updateStatus('published')} disabled={isSaving}>
                <Check className="me-1 size-4" />
                انتشار
              </Button>
            </>
          )}

          {role === 'superadmin' && (
            <Button onClick={() => void updateStatus('published')} disabled={isSaving}>
              انتشار فوری
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-6 pt-4 lg:flex-row lg:items-start">
        <section className="min-w-0 flex-1 lg:[width:calc(100%-332px)]">
          <Tabs value={activeLangTab} onValueChange={(value) => setActiveLangTab(value as 'fa' | 'en')} className="space-y-4">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="fa">محتوای اصلی (فارسی)</TabsTrigger>
              <TabsTrigger value="en">ترجمه (انگلیسی)</TabsTrigger>
            </TabsList>

            <TabsContent value="fa" className="space-y-4">
              <div>
                <Label className="mb-2">عنوان فارسی</Label>
                <Input
                  placeholder="عنوان را وارد کنید..."
                  className="h-auto border-0 border-b border-transparent px-0 text-[32px] font-medium leading-[44px] rounded-none focus-visible:border-primary focus-visible:ring-0"
                  {...register('title')}
                />
                {watchedTitle.length > 60 && (
                  <p className="mt-1 text-caption text-muted-foreground">{watchedTitle.length}/200</p>
                )}
                {errors.title && <p className="mt-1 text-caption text-destructive">عنوان الزامی است</p>}
              </div>
              <div>
                <Label className="mb-2">خلاصه فارسی</Label>
                <Textarea rows={3} {...register('excerpt')} placeholder="خلاصه خبر را وارد کنید..." />
                <p className="text-caption text-muted-foreground">{watchedExcerpt?.length || 0}/500</p>
              </div>
              <div>
                <Label className="mb-2">خلاصه تکمیلی</Label>
                <Textarea rows={4} {...register('summary')} placeholder="خلاصه بلندتر برای صفحه جزئیات..." />
                <p className="text-caption text-muted-foreground">{watchedSummary?.length || 0}/800</p>
              </div>
              <div>
                <Label className="mb-2">محتوای فارسی</Label>
                <RichTextEditor
                  content={watchedContent}
                  onChange={(value) => setValue('content', value, { shouldDirty: true })}
                  placeholder="محتوا را بنویسید..."
                />
                {errors.content && <p className="text-caption text-destructive">{errors.content.message}</p>}
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <div>
                <Label className="mb-2">عنوان انگلیسی</Label>
                <Input {...register('titleEn')} placeholder="English title..." />
                <p className="text-caption text-muted-foreground">{watchedTitleEn?.length || 0}/200</p>
              </div>
              <div>
                <Label className="mb-2">خلاصه انگلیسی</Label>
                <Textarea rows={3} {...register('excerptEn')} placeholder="English summary..." />
                <p className="text-caption text-muted-foreground">{watchedExcerptEn?.length || 0}/500</p>
              </div>
              <div>
                <Label className="mb-2">محتوای انگلیسی</Label>
                <RichTextEditor
                  content={watchedContentEn}
                  onChange={(value) => setValue('contentEn', value, { shouldDirty: true })}
                  placeholder="English content..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <aside className="w-full lg:w-[300px] lg:shrink-0">
          <div className="space-y-4 lg:sticky lg:top-20">
            <Panel title="وضعیت انتشار" icon={Clock} open={openPanels.status} onOpenChange={() => setOpenPanels((prev) => ({ ...prev, status: !prev.status }))}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-small text-muted-foreground">وضعیت فعلی</span>
                  <StatusBadge status={currentStatus} />
                </div>

                {(role === 'editor' && currentStatus === 'rejected') || (canManage && currentStatus === 'pending_review') ? (
                  <Textarea
                    placeholder="کامنت رد..."
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    rows={3}
                  />
                ) : null}

                <div className="space-y-2 rounded-[var(--radius-md)] border border-border p-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="schedule-switch" className="text-small">زمان‌بندی انتشار</Label>
                    <Switch id="schedule-switch" checked={scheduledEnabled} onCheckedChange={setScheduledEnabled} />
                  </div>
                  {scheduledEnabled && (
                    <>
                      <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                      {scheduledAt && (
                        <p className="text-caption text-muted-foreground">
                          انتشار خودکار در: {formatJalaliDateTime(new Date(scheduledAt).toISOString())}
                        </p>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setScheduledAt('')}>
                        لغو زمان‌بندی
                      </Button>
                    </>
                  )}
                </div>

                <div className="space-y-2 rounded-[var(--radius-md)] border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="reading-time" className="text-small">زمان مطالعه (دقیقه)</Label>
                    <Button variant="ghost" size="sm" onClick={calculateReadingTime}>
                      محاسبه خودکار
                    </Button>
                  </div>
                  <Input
                    id="reading-time"
                    type="number"
                    min={1}
                    max={60}
                    value={watchedReadingTime || 5}
                    onChange={(e) => setValue('readingTimeMinutes', Number(e.target.value || 5), { shouldDirty: true })}
                  />
                </div>

                <div className="space-y-2 rounded-[var(--radius-md)] border border-border p-3">
                  <Label className="text-small">نویسنده</Label>
                  <Select
                    value={watch('authorId') || ''}
                    onValueChange={(value) => setValue('authorId', value, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب نویسنده" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 rounded-[var(--radius-md)] border border-border p-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is-featured-news" className="text-small">خبر ویژه</Label>
                    <Switch
                      id="is-featured-news"
                      checked={watchedIsFeatured}
                      onCheckedChange={(checked) => setValue('isFeatured', checked, { shouldDirty: true })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is-live-news" className="text-small">پوشش زنده</Label>
                    <Switch
                      id="is-live-news"
                      checked={watchedIsLive}
                      onCheckedChange={(checked) => setValue('isLive', checked, { shouldDirty: true })}
                    />
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="تصویر شاخص" icon={ImageIcon} open={openPanels.image} onOpenChange={() => setOpenPanels((prev) => ({ ...prev, image: !prev.image }))}>
              <div className="space-y-3">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed border-border px-4 py-6 text-center text-small text-muted-foreground">
                  کلیک کنید یا فایل را بکشید
                  <span className="mt-1 text-caption">ابعاد پیشنهادی: 1200×675 پیکسل</span>
                  <input
                    ref={featuredImageInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleImageFile(e.target.files?.[0])}
                  />
                </label>
                {featuredImage && <img src={featuredImage} alt="featured" className="h-32 w-full rounded-[var(--radius-md)] object-cover" />}
                {featuredImage && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => featuredImageInputRef.current?.click()}
                    >
                      تغییر
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => setFeaturedImage('')}>
                      حذف
                    </Button>
                  </div>
                )}
                {imageError && <p className="text-caption text-destructive">{imageError}</p>}
              </div>
            </Panel>

            <Panel title="دسته‌بندی و برچسب‌ها" icon={Layers} open={openPanels.taxonomy} onOpenChange={() => setOpenPanels((prev) => ({ ...prev, taxonomy: !prev.taxonomy }))}>
              <div className="space-y-3">
                <div>
                  <Label className="text-small">دسته‌بندی‌ها</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat.id}
                        variant={selectedCategoryIds.includes(cat.id) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedCategoryIds((prev) =>
                            prev.includes(cat.id) ? prev.filter((idVal) => idVal !== cat.id) : [...prev, cat.id],
                          )
                        }}
                      >
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title="تنظیمات سئو" icon={Settings} open={openPanels.seo} onOpenChange={() => setOpenPanels((prev) => ({ ...prev, seo: !prev.seo }))}>
              <div className="space-y-3">
                <div>
                  <Label className="text-small">عنوان متا</Label>
                  <Input {...register('metaTitle')} placeholder="عنوان در نتایج جستجو" />
                  <p className="text-caption text-muted-foreground">{watch('metaTitle')?.length || 0}/۶۰ نویسه پیشنهادی</p>
                </div>
                <div>
                  <Label className="text-small">عنوان متا انگلیسی</Label>
                  <Input {...register('metaTitleEn')} placeholder="English meta title..." />
                  <p className="text-caption text-muted-foreground">{watch('metaTitleEn')?.length || 0}/۶۰ نویسه پیشنهادی</p>
                </div>
                <div>
                  <Label className="text-small">توضیحات متا</Label>
                  <Textarea rows={3} {...register('metaDescription')} placeholder="خلاصهٔ کوتاه برای نتایج جستجو" />
                  <p className="text-caption text-muted-foreground">{watch('metaDescription')?.length || 0}/۱۶۰ نویسه پیشنهادی</p>
                </div>
                <div>
                  <Label className="text-small">توضیحات متا انگلیسی</Label>
                  <Textarea rows={3} {...register('metaDescriptionEn')} placeholder="English meta description..." />
                  <p className="text-caption text-muted-foreground">{watch('metaDescriptionEn')?.length || 0}/۱۶۰ نویسه پیشنهادی</p>
                </div>
                <div>
                  <Label className="text-small">نامک آدرس</Label>
                  <Input {...register('slug')} />
                  <p
                    className={[
                      'text-caption',
                      slugState === 'duplicate' ? 'text-destructive' : 'text-muted-foreground',
                    ].join(' ')}
                  >
                    {slugState === 'checking' && 'در حال بررسی یکتایی نامک...'}
                    {slugState === 'valid' && 'نامک قابل استفاده است'}
                    {slugState === 'duplicate' && 'این نامک قبلاً استفاده شده است'}
                    {slugState === 'idle' && 'نامک را وارد کنید'}
                  </p>
                  <p className="text-caption text-muted-foreground">آدرس صفحه: voiceiran.ir/news/{watch('slug') || '...'}</p>
                </div>
                <div>
                  <Label className="text-small">آدرس مرجع</Label>
                  <Input {...register('canonicalUrl')} placeholder="https://..." />
                  <p className="text-caption text-muted-foreground">در صورت خالی بودن، از آدرس پیش‌فرض سایت استفاده می‌شود.</p>
                </div>
              </div>
            </Panel>

            <Panel title="تاریخچه" icon={History} open={openPanels.history} onOpenChange={() => setOpenPanels((prev) => ({ ...prev, history: !prev.history }))}>
              <div className="space-y-3">
                {historyItems
                  .slice(0, 20)
                  .map((entry, index) => (
                    <div key={index} className="flex items-start gap-2 text-small">
                      <span className="mt-2 size-2 rounded-full bg-primary" />
                      <div>
                        <p>{entry.actor}</p>
                        <p className="text-caption text-muted-foreground">
                          {entry.action} - {entry.date ? formatJalaliDateTime(entry.date) : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => toast.info(`تعداد ${historyItems.length.toLocaleString('fa-IR')} رویداد ثبت شده است`)}
                >
                  مشاهده تاریخچه کامل
                </Button>
              </div>
            </Panel>
          </div>
        </aside>
      </div>

      {currentStatus === 'rejected' && post?.rejectionReason && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">کامنت رد</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-small">{post.rejectionReason}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Panel({
  title,
  icon: Icon,
  open,
  onOpenChange,
  children,
}: {
  title: string
  icon: typeof Clock
  open: boolean
  onOpenChange: () => void
  children: React.ReactNode
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon className="size-4" />
              {title}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
