'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { documentsApi, martyrsApi, postsApi, publishingApi, weaponsApi, achievementsApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDateTime } from '@/lib/utils/date'
import type { ContentStatus, PublishSchedule } from '@/lib/types'
import { toast } from 'sonner'

const statusLabel: Record<PublishSchedule['status'], string> = {
  pending: 'در انتظار',
  completed: 'انجام‌شده',
  failed: 'ناموفق',
  cancelled: 'لغوشده',
}

type ContentType = 'news' | 'arsenal' | 'martyrs' | 'documents' | 'achievements'

type UnpublishedOption = {
  id: string
  contentType: ContentType
  label: string
  status: ContentStatus
}

type ScheduleFormState = {
  selectedContentKey: string
  action: PublishSchedule['action']
  scheduleDate: string
  scheduleTime: string
}

const emptyForm: ScheduleFormState = {
  selectedContentKey: '',
  action: 'publish',
  scheduleDate: '',
  scheduleTime: '',
}

const pendingStatusByType: Record<ContentType, ContentStatus> = {
  news: 'pending_review',
  arsenal: 'pending_review',
  martyrs: 'pending_review',
  documents: 'pending_review',
  achievements: 'pending_review',
}

export default function PublishingPage() {
  const { hasPermission } = usePermission('publishing')
  const [rows, setRows] = useState<PublishSchedule[]>([])
  const [options, setOptions] = useState<UnpublishedOption[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', page: 1, pageSize: 10 })
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'create' | 'edit'; row: PublishSchedule | null }>({
    open: false,
    mode: 'create',
    row: null,
  })
  const [viewModal, setViewModal] = useState<{ open: boolean; row: PublishSchedule | null }>({ open: false, row: null })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; row: PublishSchedule | null }>({ open: false, row: null })
  const [formState, setFormState] = useState<ScheduleFormState>(emptyForm)

  const load = useCallback(async () => {
    if (!hasPermission) return
    setLoading(true)
    try {
      const [schedules, news, arsenal, martyrs, documents, achievements] = await Promise.all([
        publishingApi.getSchedules(),
        postsApi.getAll({ page: 1, pageSize: 500 }),
        weaponsApi.getAll({ page: 1, pageSize: 500 }),
        martyrsApi.getAll({ page: 1, pageSize: 500 }),
        documentsApi.getAll({ page: 1, pageSize: 500 }),
        achievementsApi.getAll({ page: 1, pageSize: 500 }),
      ])

      setRows(schedules)
      const unpublished: UnpublishedOption[] = [
        ...news.data
          .filter((item) => item.status !== 'published')
          .map((item) => ({ id: item.id, contentType: 'news' as const, label: `خبر: ${item.title}`, status: item.status })),
        ...arsenal.data
          .filter((item) => item.status !== 'published')
          .map((item) => ({ id: item.id, contentType: 'arsenal' as const, label: `تسلیحات: ${item.title}`, status: item.status })),
        ...martyrs.data
          .filter((item) => item.status !== 'published')
          .map((item) => ({ id: item.id, contentType: 'martyrs' as const, label: `شهدا: ${item.title}`, status: item.status })),
        ...documents.data
          .filter((item) => item.status !== 'published')
          .map((item) => ({ id: item.id, contentType: 'documents' as const, label: `اسناد: ${item.title}`, status: item.status })),
        ...achievements.data
          .filter((item) => item.status !== 'published')
          .map((item) => ({ id: item.id, contentType: 'achievements' as const, label: `دستاورد: ${item.title}`, status: item.status })),
      ]
      setOptions(unpublished)
    } catch {
      toast.error('خطا در دریافت زمان‌بندی‌ها')
      setRows([])
      setOptions([])
    } finally {
      setLoading(false)
    }
  }, [hasPermission])

  useEffect(() => {
    void load()
  }, [load])

  const filteredRows = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => row.contentTitle.toLowerCase().includes(q) || row.contentType.toLowerCase().includes(q))
  }, [filters.search, rows])

  const pagedRows = useMemo(() => {
    const total = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize))
    const page = Math.min(filters.page, totalPages)
    const start = (page - 1) * filters.pageSize
    return {
      data: filteredRows.slice(start, start + filters.pageSize),
      total,
      page,
      pageSize: filters.pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }
  }, [filteredRows, filters.page, filters.pageSize])

  const keyOf = (type: string, id: string) => `${type}:${id}`

  const ensurePendingStatusForContent = async (contentType: ContentType, contentId: string) => {
    const pendingStatus = pendingStatusByType[contentType]
    if (contentType === 'news') {
      await postsApi.updateStatus(contentId, pendingStatus)
      return
    }
    if (contentType === 'arsenal') {
      await weaponsApi.updateStatus(contentId, pendingStatus)
      return
    }
    if (contentType === 'martyrs') {
      await martyrsApi.updateStatus(contentId, pendingStatus)
      return
    }
    if (contentType === 'documents') {
      await documentsApi.updateStatus(contentId, pendingStatus)
      return
    }
    await achievementsApi.updateStatus(contentId, pendingStatus)
  }

  const openCreate = () => {
    const firstOptionKey = options[0] ? keyOf(options[0].contentType, options[0].id) : ''
    setFormState({
      ...emptyForm,
      selectedContentKey: firstOptionKey,
    })
    setFormModal({ open: true, mode: 'create', row: null })
  }

  const openEdit = (row: PublishSchedule) => {
    const date = row.scheduledAt.slice(0, 10)
    const time = row.scheduledAt.slice(11, 16)
    const rowKey = keyOf(row.contentType, row.contentId)
    setFormState({
      selectedContentKey: rowKey,
      action: row.action,
      scheduleDate: date,
      scheduleTime: time,
    })
    setFormModal({ open: true, mode: 'edit', row })
  }

  const saveForm = async () => {
    if (!formState.selectedContentKey || !formState.scheduleDate || !formState.scheduleTime) {
      toast.error('انتخاب محتوا، تاریخ و ساعت الزامی است')
      return
    }

    const [contentTypeRaw, contentId] = formState.selectedContentKey.split(':')
    const contentType = contentTypeRaw as ContentType
    const selectedOption = options.find((option) => option.id === contentId && option.contentType === contentType)
    const contentTitle = selectedOption?.label.split(': ').slice(1).join(': ') || formModal.row?.contentTitle || 'محتوا'
    const scheduledAt = new Date(`${formState.scheduleDate}T${formState.scheduleTime}:00`).toISOString()

    try {
      await ensurePendingStatusForContent(contentType, contentId)
    } catch {
      toast.error('تغییر وضعیت محتوا به حالت در انتظار انجام نشد')
      return
    }

    const payload = {
      contentTitle,
      contentType,
      contentId,
      action: formState.action,
      scheduledAt,
      status: 'pending' as const,
    }

    if (formModal.mode === 'create') {
      const newSchedule: PublishSchedule = {
        id: crypto.randomUUID(),
        createdBy: 'مدیر سیستم',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...payload,
      }
      setRows((prev) => [newSchedule, ...prev])
      toast.success('زمان‌بندی جدید ایجاد شد و محتوا به حالت در انتظار بررسی رفت')
    } else if (formModal.row) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === formModal.row?.id
            ? {
                ...row,
                ...payload,
                updatedAt: new Date().toISOString(),
              }
            : row,
        ),
      )
      toast.success('زمان‌بندی ویرایش شد و وضعیت محتوا در حالت در انتظار بررسی قرار گرفت')
    }
    setFormModal({ open: false, mode: 'create', row: null })
  }

  const deleteSchedule = () => {
    if (!deleteModal.row) return
    setRows((prev) => prev.filter((row) => row.id !== deleteModal.row?.id))
    setDeleteModal({ open: false, row: null })
    toast.success('زمان‌بندی حذف شد')
  }

  const availableOptions = useMemo(() => {
    if (!formModal.row) return options
    const rowKey = keyOf(formModal.row.contentType, formModal.row.contentId)
    const exists = options.some((option) => keyOf(option.contentType, option.id) === rowKey)
    if (exists) return options
    return [
      {
        id: formModal.row.contentId,
        contentType: formModal.row.contentType as ContentType,
        label: `${formModal.row.contentType}: ${formModal.row.contentTitle}`,
        status: 'pending_review',
      },
      ...options,
    ]
  }, [formModal.row, options])

  const columns: ColumnDef<PublishSchedule>[] = useMemo(
    () => [
      {
        accessorKey: 'contentTitle',
        header: 'محتوا',
        cell: ({ row }) => <span className="text-small font-medium">{row.original.contentTitle}</span>,
      },
      {
        accessorKey: 'contentType',
        header: 'نوع',
        cell: ({ row }) => <span className="text-small text-muted-foreground">{row.original.contentType}</span>,
      },
      {
        accessorKey: 'action',
        header: 'اقدام',
        cell: ({ row }) => <Badge variant="outline">{row.original.action}</Badge>,
      },
      {
        accessorKey: 'scheduledAt',
        header: 'زمان برنامه',
        cell: ({ row }) => (
          <span className="text-small text-muted-foreground">{formatJalaliDateTime(row.original.scheduledAt)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'وضعیت',
        cell: ({ row }) => <span className="text-small">{statusLabel[row.original.status]}</span>,
      },
      {
        id: 'actions',
        header: 'عملیات',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setViewModal({ open: true, row: row.original })}>
              <Eye className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openEdit(row.original)}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setDeleteModal({ open: true, row: row.original })}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [openEdit],
  )

  if (!hasPermission) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border p-8 text-center text-muted-foreground">
        دسترسی به انتشار زمان‌بندی‌شده برای نقش شما فعال نیست.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>انتشار</h1>
          <p className="text-muted-foreground">زمان‌بندی انتشار بر اساس محتوای منتشرنشده</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="me-2 size-4" />
          زمان‌بندی جدید
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={pagedRows.data}
        isLoading={loading}
        onSearch={(search) => setFilters((prev) => ({ ...prev, search, page: 1 }))}
        hasActiveFilters={Boolean(filters.search)}
        onClearFilters={() => setFilters((prev) => ({ ...prev, search: '', page: 1 }))}
        pagination={{
          page: pagedRows.page,
          pageSize: pagedRows.pageSize,
          total: pagedRows.total,
          totalPages: pagedRows.totalPages,
          onPageChange: (page) => setFilters((prev) => ({ ...prev, page })),
          onPageSizeChange: (pageSize) => setFilters((prev) => ({ ...prev, pageSize, page: 1 })),
        }}
        emptyState={{ title: 'زمان‌بندی فعالی نیست' }}
        onRowClick={(row) => setViewModal({ open: true, row })}
      />

      <Dialog open={formModal.open} onOpenChange={(open) => setFormModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formModal.mode === 'create' ? 'ایجاد زمان‌بندی' : 'ویرایش زمان‌بندی'}</DialogTitle>
            <DialogDescription>محتوا، تاریخ و ساعت انتشار را انتخاب کنید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>محتوای منتشرنشده</Label>
              <Select value={formState.selectedContentKey} onValueChange={(value) => setFormState((prev) => ({ ...prev, selectedContentKey: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب محتوا" />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      موردی برای زمان‌بندی وجود ندارد
                    </SelectItem>
                  ) : (
                    availableOptions.map((option) => (
                      <SelectItem key={keyOf(option.contentType, option.id)} value={keyOf(option.contentType, option.id)}>
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>اقدام</Label>
              <Select value={formState.action} onValueChange={(value: PublishSchedule['action']) => setFormState((prev) => ({ ...prev, action: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publish">انتشار</SelectItem>
                  <SelectItem value="unpublish">خارج از انتشار</SelectItem>
                  <SelectItem value="archive">آرشیو</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>تاریخ</Label>
                <Input
                  type="date"
                  value={formState.scheduleDate}
                  onChange={(e) => setFormState((prev) => ({ ...prev, scheduleDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>ساعت</Label>
                <Input
                  type="time"
                  value={formState.scheduleTime}
                  onChange={(e) => setFormState((prev) => ({ ...prev, scheduleTime: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormModal({ open: false, mode: 'create', row: null })}>
              انصراف
            </Button>
            <Button onClick={() => void saveForm()}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewModal.open} onOpenChange={(open) => setViewModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جزئیات زمان‌بندی</DialogTitle>
            <DialogDescription>نمایش اطلاعات کامل زمان‌بندی انتخاب‌شده.</DialogDescription>
          </DialogHeader>
          {viewModal.row ? (
            <div className="space-y-2 text-small">
              <p>عنوان: {viewModal.row.contentTitle}</p>
              <p>نوع: {viewModal.row.contentType}</p>
              <p>اقدام: {viewModal.row.action}</p>
              <p>وضعیت: {statusLabel[viewModal.row.status]}</p>
              <p>زمان: {formatJalaliDateTime(viewModal.row.scheduledAt)}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModal({ open: false, row: null })}>
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, row: open ? deleteModal.row : null })}
        onConfirm={deleteSchedule}
        title={`حذف ${deleteModal.row?.contentTitle || 'زمان‌بندی'}`}
        itemName={deleteModal.row?.contentTitle}
      />
    </div>
  )
}
