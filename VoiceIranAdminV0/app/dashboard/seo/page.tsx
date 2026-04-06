'use client'

import { useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { seoApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDateTime } from '@/lib/utils/date'
import type { RedirectRule, SeoConfig } from '@/lib/types'
import { toast } from 'sonner'

type SeoFormState = {
  path: string
  metaTitle: string
  metaDescription: string
  isActive: boolean
}

type RedirectFormState = {
  sourcePath: string
  targetPath: string
  redirectType: RedirectRule['redirectType']
  isActive: boolean
}

const emptySeoForm: SeoFormState = {
  path: '',
  metaTitle: '',
  metaDescription: '',
  isActive: true,
}

const emptyRedirectForm: RedirectFormState = {
  sourcePath: '',
  targetPath: '',
  redirectType: 301,
  isActive: true,
}

export default function SeoAdminPage() {
  const { hasPermission } = usePermission('seo')
  const [configs, setConfigs] = useState<SeoConfig[]>([])
  const [redirects, setRedirects] = useState<RedirectRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [configFilters, setConfigFilters] = useState({ search: '', page: 1, pageSize: 10 })
  const [redirectFilters, setRedirectFilters] = useState({ search: '', page: 1, pageSize: 10 })
  const [configModal, setConfigModal] = useState<{ open: boolean; mode: 'create' | 'edit'; item: SeoConfig | null }>({
    open: false,
    mode: 'create',
    item: null,
  })
  const [redirectModal, setRedirectModal] = useState<{ open: boolean; mode: 'create' | 'edit'; item: RedirectRule | null }>({
    open: false,
    mode: 'create',
    item: null,
  })
  const [configDeleteModal, setConfigDeleteModal] = useState<{ open: boolean; item: SeoConfig | null }>({ open: false, item: null })
  const [redirectDeleteModal, setRedirectDeleteModal] = useState<{ open: boolean; item: RedirectRule | null }>({ open: false, item: null })
  const [configViewModal, setConfigViewModal] = useState<{ open: boolean; item: SeoConfig | null }>({ open: false, item: null })
  const [redirectViewModal, setRedirectViewModal] = useState<{ open: boolean; item: RedirectRule | null }>({ open: false, item: null })
  const [seoForm, setSeoForm] = useState<SeoFormState>(emptySeoForm)
  const [redirectForm, setRedirectForm] = useState<RedirectFormState>(emptyRedirectForm)

  useEffect(() => {
    if (!hasPermission) return
    Promise.all([seoApi.getConfigs(), seoApi.getRedirects()])
      .then(([c, r]) => {
        setConfigs(c)
        setRedirects(r)
      })
      .catch(() => {
        toast.error('خطا در دریافت دادهٔ سئو')
        setConfigs([])
        setRedirects([])
      })
      .finally(() => setIsLoading(false))
  }, [hasPermission])

  const filteredConfigs = useMemo(() => {
    const q = configFilters.search.trim().toLowerCase()
    if (!q) return configs
    return configs.filter(
      (c) => c.path.toLowerCase().includes(q) || (c.metaTitle || '').toLowerCase().includes(q),
    )
  }, [configFilters.search, configs])

  const filteredRedirects = useMemo(() => {
    const q = redirectFilters.search.trim().toLowerCase()
    if (!q) return redirects
    return redirects.filter(
      (r) => r.sourcePath.toLowerCase().includes(q) || r.targetPath.toLowerCase().includes(q),
    )
  }, [redirectFilters.search, redirects])

  const pagedConfigs = useMemo(() => {
    const total = filteredConfigs.length
    const totalPages = Math.max(1, Math.ceil(total / configFilters.pageSize))
    const page = Math.min(configFilters.page, totalPages)
    const start = (page - 1) * configFilters.pageSize
    return {
      data: filteredConfigs.slice(start, start + configFilters.pageSize),
      total,
      page,
      pageSize: configFilters.pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }
  }, [configFilters.page, configFilters.pageSize, filteredConfigs])

  const pagedRedirects = useMemo(() => {
    const total = filteredRedirects.length
    const totalPages = Math.max(1, Math.ceil(total / redirectFilters.pageSize))
    const page = Math.min(redirectFilters.page, totalPages)
    const start = (page - 1) * redirectFilters.pageSize
    return {
      data: filteredRedirects.slice(start, start + redirectFilters.pageSize),
      total,
      page,
      pageSize: redirectFilters.pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }
  }, [filteredRedirects, redirectFilters.page, redirectFilters.pageSize])

  const openCreateConfig = () => {
    setSeoForm(emptySeoForm)
    setConfigModal({ open: true, mode: 'create', item: null })
  }

  const openEditConfig = (item: SeoConfig) => {
    setSeoForm({
      path: item.path,
      metaTitle: item.metaTitle || '',
      metaDescription: item.metaDescription || '',
      isActive: item.isActive,
    })
    setConfigModal({ open: true, mode: 'edit', item })
  }

  const saveConfig = () => {
    const path = seoForm.path.trim()
    if (!path) {
      toast.error('مسیر صفحه الزامی است')
      return
    }
    const payload = {
      path,
      metaTitle: seoForm.metaTitle.trim() || undefined,
      metaDescription: seoForm.metaDescription.trim() || undefined,
      isActive: seoForm.isActive,
    }
    if (configModal.mode === 'create') {
      const newConfig: SeoConfig = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...payload,
      }
      setConfigs((prev) => [newConfig, ...prev])
      toast.success('قانون سئو ایجاد شد')
    } else if (configModal.item) {
      setConfigs((prev) =>
        prev.map((config) =>
          config.id === configModal.item?.id
            ? {
                ...config,
                ...payload,
                updatedAt: new Date().toISOString(),
              }
            : config,
        ),
      )
      toast.success('قانون سئو ویرایش شد')
    }
    setConfigModal({ open: false, mode: 'create', item: null })
  }

  const openCreateRedirect = () => {
    setRedirectForm(emptyRedirectForm)
    setRedirectModal({ open: true, mode: 'create', item: null })
  }

  const openEditRedirect = (item: RedirectRule) => {
    setRedirectForm({
      sourcePath: item.sourcePath,
      targetPath: item.targetPath,
      redirectType: item.redirectType,
      isActive: item.isActive,
    })
    setRedirectModal({ open: true, mode: 'edit', item })
  }

  const saveRedirect = () => {
    const sourcePath = redirectForm.sourcePath.trim()
    const targetPath = redirectForm.targetPath.trim()
    if (!sourcePath || !targetPath) {
      toast.error('مبدأ و مقصد الزامی هستند')
      return
    }
    const payload = {
      sourcePath,
      targetPath,
      redirectType: redirectForm.redirectType,
      isActive: redirectForm.isActive,
    }
    if (redirectModal.mode === 'create') {
      const newRedirect: RedirectRule = {
        id: crypto.randomUUID(),
        hitCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...payload,
      }
      setRedirects((prev) => [newRedirect, ...prev])
      toast.success('ریدایرکت جدید ایجاد شد')
    } else if (redirectModal.item) {
      setRedirects((prev) =>
        prev.map((redirect) =>
          redirect.id === redirectModal.item?.id
            ? {
                ...redirect,
                ...payload,
                updatedAt: new Date().toISOString(),
              }
            : redirect,
        ),
      )
      toast.success('ریدایرکت ویرایش شد')
    }
    setRedirectModal({ open: false, mode: 'create', item: null })
  }

  const deleteConfig = () => {
    if (!configDeleteModal.item) return
    setConfigs((prev) => prev.filter((config) => config.id !== configDeleteModal.item?.id))
    setConfigDeleteModal({ open: false, item: null })
    toast.success('قانون سئو حذف شد')
  }

  const deleteRedirect = () => {
    if (!redirectDeleteModal.item) return
    setRedirects((prev) => prev.filter((redirect) => redirect.id !== redirectDeleteModal.item?.id))
    setRedirectDeleteModal({ open: false, item: null })
    toast.success('ریدایرکت حذف شد')
  }

  const configColumns: ColumnDef<SeoConfig>[] = useMemo(
    () => [
      {
        accessorKey: 'path',
        header: 'مسیر',
        cell: ({ row }) => (
          <span className="font-mono text-small" dir="ltr">
            {row.original.path}
          </span>
        ),
      },
      {
        accessorKey: 'metaTitle',
        header: 'عنوان متا',
        cell: ({ row }) => <span className="text-small">{row.original.metaTitle || '—'}</span>,
      },
      {
        accessorKey: 'isActive',
        header: 'فعال',
        cell: ({ row }) => <Badge variant={row.original.isActive ? 'default' : 'secondary'}>{row.original.isActive ? 'بله' : 'خیر'}</Badge>,
      },
      {
        accessorKey: 'updatedAt',
        header: 'به‌روزرسانی',
        cell: ({ row }) => <span className="text-caption text-muted-foreground">{formatJalaliDateTime(row.original.updatedAt)}</span>,
      },
      {
        id: 'actions',
        header: 'عملیات',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setConfigViewModal({ open: true, item: row.original })}>
              <Eye className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openEditConfig(row.original)}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setConfigDeleteModal({ open: true, item: row.original })}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const redirectColumns: ColumnDef<RedirectRule>[] = useMemo(
    () => [
      {
        accessorKey: 'sourcePath',
        header: 'مبدأ',
        cell: ({ row }) => (
          <span className="font-mono text-small" dir="ltr">
            {row.original.sourcePath}
          </span>
        ),
      },
      {
        accessorKey: 'targetPath',
        header: 'مقصد',
        cell: ({ row }) => (
          <span className="font-mono text-small" dir="ltr">
            {row.original.targetPath}
          </span>
        ),
      },
      {
        accessorKey: 'redirectType',
        header: 'نوع',
        cell: ({ row }) => <Badge variant="outline">{row.original.redirectType}</Badge>,
      },
      {
        accessorKey: 'hitCount',
        header: 'بازدید',
        cell: ({ row }) => <span className="text-small">{row.original.hitCount.toLocaleString('fa-IR')}</span>,
      },
      {
        id: 'actions',
        header: 'عملیات',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setRedirectViewModal({ open: true, item: row.original })}>
              <Eye className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openEditRedirect(row.original)}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setRedirectDeleteModal({ open: true, item: row.original })}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  if (!hasPermission) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border p-8 text-center text-muted-foreground">
        دسترسی به مدیریت سئو برای نقش شما فعال نیست.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1>سئو</h1>
        <p className="text-muted-foreground">قوانین متا و ریدایرکت‌ها (دادهٔ نمونه)</p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base">قوانین متا صفحات</h2>
          <Button onClick={openCreateConfig}>
            <Plus className="me-2 size-4" />
            قانون متا جدید
          </Button>
        </div>
        <DataTable
          columns={configColumns}
          data={pagedConfigs.data}
          isLoading={isLoading}
          onSearch={(search) => setConfigFilters((prev) => ({ ...prev, search, page: 1 }))}
          hasActiveFilters={Boolean(configFilters.search)}
          onClearFilters={() => setConfigFilters((prev) => ({ ...prev, search: '', page: 1 }))}
          pagination={{
            page: pagedConfigs.page,
            pageSize: pagedConfigs.pageSize,
            total: pagedConfigs.total,
            totalPages: pagedConfigs.totalPages,
            onPageChange: (page) => setConfigFilters((prev) => ({ ...prev, page })),
            onPageSizeChange: (pageSize) => setConfigFilters((prev) => ({ ...prev, pageSize, page: 1 })),
          }}
          emptyState={{ title: 'قانون متایی ثبت نشده است' }}
          onRowClick={(row) => setConfigViewModal({ open: true, item: row })}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base">ریدایرکت‌ها</h2>
          <Button onClick={openCreateRedirect}>
            <Plus className="me-2 size-4" />
            ریدایرکت جدید
          </Button>
        </div>
        <DataTable
          columns={redirectColumns}
          data={pagedRedirects.data}
          isLoading={isLoading}
          onSearch={(search) => setRedirectFilters((prev) => ({ ...prev, search, page: 1 }))}
          hasActiveFilters={Boolean(redirectFilters.search)}
          onClearFilters={() => setRedirectFilters((prev) => ({ ...prev, search: '', page: 1 }))}
          pagination={{
            page: pagedRedirects.page,
            pageSize: pagedRedirects.pageSize,
            total: pagedRedirects.total,
            totalPages: pagedRedirects.totalPages,
            onPageChange: (page) => setRedirectFilters((prev) => ({ ...prev, page })),
            onPageSizeChange: (pageSize) => setRedirectFilters((prev) => ({ ...prev, pageSize, page: 1 })),
          }}
          emptyState={{ title: 'ریدایرکتی ثبت نشده است' }}
          onRowClick={(row) => setRedirectViewModal({ open: true, item: row })}
        />
      </section>

      <Dialog open={configModal.open} onOpenChange={(open) => setConfigModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{configModal.mode === 'create' ? 'ایجاد قانون متا' : 'ویرایش قانون متا'}</DialogTitle>
            <DialogDescription>تنظیمات متا برای مسیر موردنظر را وارد کنید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>مسیر</Label>
              <Input dir="ltr" value={seoForm.path} onChange={(e) => setSeoForm((prev) => ({ ...prev, path: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>عنوان متا</Label>
              <Input value={seoForm.metaTitle} onChange={(e) => setSeoForm((prev) => ({ ...prev, metaTitle: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>توضیحات متا</Label>
              <Input value={seoForm.metaDescription} onChange={(e) => setSeoForm((prev) => ({ ...prev, metaDescription: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-active">فعال</Label>
              <Switch id="seo-active" checked={seoForm.isActive} onCheckedChange={(checked) => setSeoForm((prev) => ({ ...prev, isActive: checked }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigModal({ open: false, mode: 'create', item: null })}>
              انصراف
            </Button>
            <Button onClick={saveConfig}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={redirectModal.open} onOpenChange={(open) => setRedirectModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{redirectModal.mode === 'create' ? 'ایجاد ریدایرکت' : 'ویرایش ریدایرکت'}</DialogTitle>
            <DialogDescription>مبدأ و مقصد ریدایرکت را تعریف کنید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>مبدأ</Label>
              <Input dir="ltr" value={redirectForm.sourcePath} onChange={(e) => setRedirectForm((prev) => ({ ...prev, sourcePath: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>مقصد</Label>
              <Input dir="ltr" value={redirectForm.targetPath} onChange={(e) => setRedirectForm((prev) => ({ ...prev, targetPath: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>نوع ریدایرکت</Label>
              <Select value={String(redirectForm.redirectType)} onValueChange={(value: string) => setRedirectForm((prev) => ({ ...prev, redirectType: Number(value) as RedirectRule['redirectType'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="301">301</SelectItem>
                  <SelectItem value="302">302</SelectItem>
                  <SelectItem value="307">307</SelectItem>
                  <SelectItem value="308">308</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="redirect-active">فعال</Label>
              <Switch id="redirect-active" checked={redirectForm.isActive} onCheckedChange={(checked) => setRedirectForm((prev) => ({ ...prev, isActive: checked }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedirectModal({ open: false, mode: 'create', item: null })}>
              انصراف
            </Button>
            <Button onClick={saveRedirect}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={configViewModal.open} onOpenChange={(open) => setConfigViewModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جزئیات قانون متا</DialogTitle>
            <DialogDescription>نمایش جزئیات قانون متای انتخاب‌شده.</DialogDescription>
          </DialogHeader>
          {configViewModal.item ? (
            <div className="space-y-2 text-small">
              <p dir="ltr">Path: {configViewModal.item.path}</p>
              <p>عنوان: {configViewModal.item.metaTitle || '—'}</p>
              <p>توضیحات: {configViewModal.item.metaDescription || '—'}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigViewModal({ open: false, item: null })}>
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={redirectViewModal.open} onOpenChange={(open) => setRedirectViewModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جزئیات ریدایرکت</DialogTitle>
            <DialogDescription>نمایش جزئیات ریدایرکت انتخاب‌شده.</DialogDescription>
          </DialogHeader>
          {redirectViewModal.item ? (
            <div className="space-y-2 text-small">
              <p dir="ltr">Source: {redirectViewModal.item.sourcePath}</p>
              <p dir="ltr">Target: {redirectViewModal.item.targetPath}</p>
              <p>نوع: {redirectViewModal.item.redirectType}</p>
              <p>بازدید: {redirectViewModal.item.hitCount.toLocaleString('fa-IR')}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedirectViewModal({ open: false, item: null })}>
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={configDeleteModal.open}
        onOpenChange={(open) => setConfigDeleteModal({ open, item: open ? configDeleteModal.item : null })}
        onConfirm={deleteConfig}
        title={`حذف ${configDeleteModal.item?.path || 'قانون متا'}`}
        itemName={configDeleteModal.item?.path}
      />

      <ConfirmDeleteModal
        open={redirectDeleteModal.open}
        onOpenChange={(open) => setRedirectDeleteModal({ open, item: open ? redirectDeleteModal.item : null })}
        onConfirm={deleteRedirect}
        title={`حذف ${redirectDeleteModal.item?.sourcePath || 'ریدایرکت'}`}
        itemName={redirectDeleteModal.item?.sourcePath}
      />
    </div>
  )
}
