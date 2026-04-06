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
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usersApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDateTime } from '@/lib/utils/date'
import { ROLE_LABELS, type Role, type UserRole } from '@/lib/types'
import { toast } from 'sonner'

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value: value as UserRole, label }))

type RoleFormState = {
  name: string
  codename: UserRole
}

export default function RolesPage() {
  const { hasPermission } = usePermission('accounts')
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', page: 1, pageSize: 10 })
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'create' | 'edit'; role: Role | null }>({
    open: false,
    mode: 'create',
    role: null,
  })
  const [viewModal, setViewModal] = useState<{ open: boolean; role: Role | null }>({ open: false, role: null })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; role: Role | null }>({ open: false, role: null })
  const [formState, setFormState] = useState<RoleFormState>({ name: '', codename: 'viewer' })

  useEffect(() => {
    if (!hasPermission) return
    usersApi
      .getRoles()
      .then(setRoles)
      .catch(() => {
        toast.error('خطا در دریافت نقش‌ها')
        setRoles([])
      })
      .finally(() => setIsLoading(false))
  }, [hasPermission])

  const filteredRoles = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    if (!q) return roles
    return roles.filter((role) => role.name.toLowerCase().includes(q) || role.codename.toLowerCase().includes(q))
  }, [filters.search, roles])

  const pagedRoles = useMemo(() => {
    const total = filteredRoles.length
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize))
    const page = Math.min(filters.page, totalPages)
    const start = (page - 1) * filters.pageSize
    return {
      data: filteredRoles.slice(start, start + filters.pageSize),
      total,
      page,
      pageSize: filters.pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }
  }, [filteredRoles, filters.page, filters.pageSize])

  const openCreate = () => {
    setFormState({ name: '', codename: 'viewer' })
    setFormModal({ open: true, mode: 'create', role: null })
  }

  const openEdit = (role: Role) => {
    setFormState({ name: role.name, codename: role.codename })
    setFormModal({ open: true, mode: 'edit', role })
  }

  const saveForm = () => {
    const name = formState.name.trim()
    if (!name) {
      toast.error('نام نقش الزامی است')
      return
    }
    if (formModal.mode === 'create') {
      const newRole: Role = {
        id: crypto.randomUUID(),
        name,
        codename: formState.codename,
        permissions: [],
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setRoles((prev) => [newRole, ...prev])
      toast.success('نقش جدید ایجاد شد')
    } else if (formModal.role) {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === formModal.role?.id
            ? { ...role, name, codename: formState.codename, updatedAt: new Date().toISOString() }
            : role,
        ),
      )
      toast.success('نقش ویرایش شد')
    }
    setFormModal({ open: false, mode: 'create', role: null })
  }

  const deleteRole = () => {
    if (!deleteModal.role) return
    setRoles((prev) => prev.filter((role) => role.id !== deleteModal.role?.id))
    setDeleteModal({ open: false, role: null })
    toast.success('نقش حذف شد')
  }

  const columns: ColumnDef<Role>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'نام نقش',
        cell: ({ row }) => <span className="text-small font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'codename',
        header: 'کد نقش',
        cell: ({ row }) => <span dir="ltr" className="text-small text-muted-foreground">{row.original.codename}</span>,
      },
      {
        accessorKey: 'userCount',
        header: 'تعداد کاربران',
        cell: ({ row }) => <Badge variant="secondary">{row.original.userCount.toLocaleString('fa-IR')}</Badge>,
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
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setViewModal({ open: true, role: row.original })}>
              <Eye className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openEdit(row.original)}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setDeleteModal({ open: true, role: row.original })}>
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
        فقط مدیر ارشد به این بخش دسترسی دارد.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>نقش‌ها</h1>
          <p className="text-muted-foreground">نقش‌های ازپیش‌تعریف‌شده و تعداد کاربران هر نقش</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="me-2 size-4" />
          نقش جدید
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={pagedRoles.data}
        isLoading={isLoading}
        onSearch={(search) => setFilters((prev) => ({ ...prev, search, page: 1 }))}
        hasActiveFilters={Boolean(filters.search)}
        onClearFilters={() => setFilters((prev) => ({ ...prev, search: '', page: 1 }))}
        pagination={{
          page: pagedRoles.page,
          pageSize: pagedRoles.pageSize,
          total: pagedRoles.total,
          totalPages: pagedRoles.totalPages,
          onPageChange: (page) => setFilters((prev) => ({ ...prev, page })),
          onPageSizeChange: (pageSize) => setFilters((prev) => ({ ...prev, pageSize, page: 1 })),
        }}
        emptyState={{ title: 'نقشی ثبت نشده است' }}
        onRowClick={(row) => setViewModal({ open: true, role: row })}
      />

      <Dialog open={formModal.open} onOpenChange={(open) => setFormModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formModal.mode === 'create' ? 'ایجاد نقش' : 'ویرایش نقش'}</DialogTitle>
            <DialogDescription>نام و کد نقش را مشخص کنید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نام نقش</Label>
              <Input value={formState.name} onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>کد نقش</Label>
              <Select value={formState.codename} onValueChange={(value: UserRole) => setFormState((prev) => ({ ...prev, codename: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormModal({ open: false, mode: 'create', role: null })}>
              انصراف
            </Button>
            <Button onClick={saveForm}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewModal.open} onOpenChange={(open) => setViewModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جزئیات نقش</DialogTitle>
            <DialogDescription>مشاهده اطلاعات و تعداد کاربران این نقش.</DialogDescription>
          </DialogHeader>
          {viewModal.role ? (
            <div className="space-y-2 text-small">
              <p>نام: {viewModal.role.name}</p>
              <p dir="ltr">Codename: {viewModal.role.codename}</p>
              <p>تعداد کاربران: {viewModal.role.userCount.toLocaleString('fa-IR')}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModal({ open: false, role: null })}>
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, role: open ? deleteModal.role : null })}
        onConfirm={deleteRole}
        title={`حذف ${deleteModal.role?.name || 'نقش'}`}
        itemName={deleteModal.role?.name}
      />
    </div>
  )
}
