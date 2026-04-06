'use client'

import { useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { apiManagementApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDateTime } from '@/lib/utils/date'
import type { ApiClient } from '@/lib/types'
import { toast } from 'sonner'

type ClientFormState = {
  name: string
  description: string
  clientId: string
  rateLimit: string
  isActive: boolean
}

const emptyForm: ClientFormState = {
  name: '',
  description: '',
  clientId: '',
  rateLimit: '',
  isActive: true,
}

export default function ApiManagementPage() {
  const { hasPermission } = usePermission('api')
  const [rows, setRows] = useState<ApiClient[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', page: 1, pageSize: 10 })
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'create' | 'edit'; item: ApiClient | null }>({
    open: false,
    mode: 'create',
    item: null,
  })
  const [viewModal, setViewModal] = useState<{ open: boolean; item: ApiClient | null }>({ open: false, item: null })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: ApiClient | null }>({ open: false, item: null })
  const [formState, setFormState] = useState<ClientFormState>(emptyForm)

  useEffect(() => {
    if (!hasPermission) return
    apiManagementApi
      .getClients()
      .then(setRows)
      .catch(() => {
        toast.error('خطا در دریافت کلاینت‌ها')
        setRows([])
      })
      .finally(() => setLoading(false))
  }, [hasPermission])

  const filteredRows = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => row.name.toLowerCase().includes(q) || row.clientId.toLowerCase().includes(q))
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

  const openCreate = () => {
    setFormState(emptyForm)
    setFormModal({ open: true, mode: 'create', item: null })
  }

  const openEdit = (item: ApiClient) => {
    setFormState({
      name: item.name,
      description: item.description || '',
      clientId: item.clientId,
      rateLimit: item.rateLimit != null ? String(item.rateLimit) : '',
      isActive: item.isActive,
    })
    setFormModal({ open: true, mode: 'edit', item })
  }

  const saveForm = () => {
    const name = formState.name.trim()
    const clientId = formState.clientId.trim()
    if (!name || !clientId) {
      toast.error('نام و شناسه کلاینت الزامی هستند')
      return
    }
    const payload = {
      name,
      description: formState.description.trim() || undefined,
      clientId,
      rateLimit: formState.rateLimit ? Number(formState.rateLimit) : undefined,
      isActive: formState.isActive,
    }
    if (formModal.mode === 'create') {
      const newItem: ApiClient = {
        id: crypto.randomUUID(),
        name: payload.name,
        description: payload.description,
        clientId: payload.clientId,
        isActive: payload.isActive,
        rateLimit: payload.rateLimit,
        rateLimitPeriod: 'hour',
        requestCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setRows((prev) => [newItem, ...prev])
      toast.success('کلاینت API ایجاد شد')
    } else if (formModal.item) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === formModal.item?.id
            ? { ...row, ...payload, updatedAt: new Date().toISOString() }
            : row,
        ),
      )
      toast.success('کلاینت API ویرایش شد')
    }
    setFormModal({ open: false, mode: 'create', item: null })
  }

  const deleteItem = () => {
    if (!deleteModal.item) return
    setRows((prev) => prev.filter((row) => row.id !== deleteModal.item?.id))
    setDeleteModal({ open: false, item: null })
    toast.success('کلاینت API حذف شد')
  }

  const columns: ColumnDef<ApiClient>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'نام',
        cell: ({ row }) => <span className="text-small font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'clientId',
        header: 'شناسه',
        cell: ({ row }) => (
          <span className="font-mono text-caption" dir="ltr">
            {row.original.clientId}
          </span>
        ),
      },
      {
        id: 'active',
        header: 'وضعیت',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
            {row.original.isActive ? 'فعال' : 'غیرفعال'}
          </Badge>
        ),
      },
      {
        accessorKey: 'rateLimit',
        header: 'محدودیت',
        cell: ({ row }) => (
          <span className="text-small text-muted-foreground">
            {row.original.rateLimit != null ? `${row.original.rateLimit} / ${row.original.rateLimitPeriod || 'ساعت'}` : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'به‌روزرسانی',
        cell: ({ row }) => (
          <span className="text-caption text-muted-foreground">{formatJalaliDateTime(row.original.updatedAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: 'عملیات',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setViewModal({ open: true, item: row.original })}>
              <Eye className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openEdit(row.original)}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setDeleteModal({ open: true, item: row.original })}>
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
        فقط مدیر ارشد به API دسترسی دارد.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>مدیریت API</h1>
          <p className="text-muted-foreground">کلاینت‌ها و محدودیت نرخ (نمونه)</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="me-2 size-4" />
          کلاینت جدید
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
        emptyState={{ title: 'کلاینتی ثبت نشده' }}
        onRowClick={(row) => setViewModal({ open: true, item: row })}
      />

      <Dialog open={formModal.open} onOpenChange={(open) => setFormModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formModal.mode === 'create' ? 'ایجاد کلاینت API' : 'ویرایش کلاینت API'}</DialogTitle>
            <DialogDescription>مشخصات کلاینت API را تنظیم و ذخیره کنید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نام</Label>
              <Input value={formState.name} onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>توضیحات</Label>
              <Input value={formState.description} onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Client ID</Label>
              <Input dir="ltr" value={formState.clientId} onChange={(e) => setFormState((prev) => ({ ...prev, clientId: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Rate Limit</Label>
              <Input type="number" min={0} value={formState.rateLimit} onChange={(e) => setFormState((prev) => ({ ...prev, rateLimit: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="api-active">فعال</Label>
              <Switch id="api-active" checked={formState.isActive} onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isActive: checked }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormModal({ open: false, mode: 'create', item: null })}>
              انصراف
            </Button>
            <Button onClick={saveForm}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewModal.open} onOpenChange={(open) => setViewModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جزئیات کلاینت API</DialogTitle>
            <DialogDescription>نمایش شناسه و وضعیت کلاینت انتخاب‌شده.</DialogDescription>
          </DialogHeader>
          {viewModal.item ? (
            <div className="space-y-2 text-small">
              <p>نام: {viewModal.item.name}</p>
              <p dir="ltr">Client ID: {viewModal.item.clientId}</p>
              <p>وضعیت: {viewModal.item.isActive ? 'فعال' : 'غیرفعال'}</p>
              <p>تعداد درخواست: {viewModal.item.requestCount.toLocaleString('fa-IR')}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModal({ open: false, item: null })}>
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, item: open ? deleteModal.item : null })}
        onConfirm={deleteItem}
        title={`حذف ${deleteModal.item?.name || 'کلاینت API'}`}
        itemName={deleteModal.item?.name}
      />
    </div>
  )
}
