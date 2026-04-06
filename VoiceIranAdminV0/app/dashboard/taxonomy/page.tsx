'use client'

import { useCallback, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal'
import { categoriesApi, tagsApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import type { Category, Tag } from '@/lib/types'
import { toast } from 'sonner'

export default function TaxonomyPage() {
  const { hasPermission } = usePermission('taxonomy')
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [tags, setTags] = useState<Tag[] | null>(null)
  const [newCat, setNewCat] = useState('')
  const [newTag, setNewTag] = useState('')
  const [busy, setBusy] = useState<'cat' | 'tag' | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  })

  const load = useCallback(async () => {
    if (!hasPermission) return
    const [c, t] = await Promise.all([categoriesApi.getAll(), tagsApi.getAll()])
    setCategories(c)
    setTags(t)
  }, [hasPermission])

  useEffect(() => {
    void load()
  }, [load])

  const addCategory = async () => {
    const name = newCat.trim()
    if (!name) return
    setBusy('cat')
    try {
      const slug = name.replace(/\s+/g, '-').replace(/[^\u0600-\u06FFa-z0-9-]/gi, '')
      await categoriesApi.create({ name, slug: slug || `cat-${Date.now()}` })
      setNewCat('')
      toast.success('دسته اضافه شد')
      await load()
    } catch {
      toast.error('ایجاد دسته ناموفق بود')
    } finally {
      setBusy(null)
    }
  }

  const addTag = async () => {
    const name = newTag.trim()
    if (!name) return
    setBusy('tag')
    try {
      const slug = name.replace(/\s+/g, '-').replace(/[^\u0600-\u06FFa-z0-9-]/gi, '')
      await tagsApi.create({ name, slug: slug || `tag-${Date.now()}` })
      setNewTag('')
      toast.success('برچسب اضافه شد')
      await load()
    } catch {
      toast.error('ایجاد برچسب ناموفق بود')
    } finally {
      setBusy(null)
    }
  }

  const deleteCategory = () => {
    if (!deleteModal.category) return
    setCategories((prev) => (prev ? prev.filter((item) => item.id !== deleteModal.category?.id) : prev))
    setDeleteModal({ open: false, category: null })
    toast.success('دسته حذف شد')
  }

  if (!hasPermission) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border p-8 text-center text-muted-foreground">
        دسترسی به طبقه‌بندی برای نقش شما فعال نیست.
      </div>
    )
  }

  if (!categories || !tags) {
    return <Skeleton className="h-96 rounded-[var(--radius-lg)]" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>طبقه‌بندی</h1>
        <p className="text-muted-foreground">دسته‌بندی‌ها و برچسب‌های مشترک محتوا</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">دسته‌بندی‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="new-cat">نام دسته جدید</Label>
                <Input id="new-cat" value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="مثلاً سیاست دفاعی" />
              </div>
              <Button type="button" disabled={busy === 'cat'} onClick={() => void addCategory()}>
                افزودن
              </Button>
            </div>
            <ul className="max-h-72 space-y-2 overflow-y-auto text-small">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border px-3 py-2">
                  <span>{c.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{c.postCount.toLocaleString('fa-IR')} مطلب</Badge>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteModal({ open: true, category: c })}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">برچسب‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="new-tag">نام برچسب جدید</Label>
                <Input id="new-tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="مثلاً پهپاد" />
              </div>
              <Button type="button" disabled={busy === 'tag'} onClick={() => void addTag()}>
                افزودن
              </Button>
            </div>
            <div className="flex max-h-72 flex-wrap gap-2 overflow-y-auto">
              {tags.map((t) => (
                <Badge key={t.id} variant="outline" className="text-small">
                  {t.name}
                  <span className="me-1 text-caption text-muted-foreground">({t.postCount.toLocaleString('fa-IR')})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, category: open ? deleteModal.category : null })}
        onConfirm={deleteCategory}
        title={`حذف ${deleteModal.category?.name || 'دسته'}`}
        itemName={deleteModal.category?.name}
      />
    </div>
  )
}
