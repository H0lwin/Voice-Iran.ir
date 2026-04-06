'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { usersApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDateTime } from '@/lib/utils/date'
import type { PaginatedResponse, Role, User } from '@/lib/types'
import { toast } from 'sonner'

type UserFormState = {
  fullName: string
  username: string
  email: string
  phone: string
  roleIds: string[]
  isActive: boolean
  password: string
}

const emptyForm: UserFormState = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  roleIds: [],
  isActive: true,
  password: '',
}

export default function UsersPage() {
  const { hasPermission } = usePermission('accounts')
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ search: '', page: 1, pageSize: 10 })
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'create' | 'edit'; user: User | null }>({
    open: false,
    mode: 'create',
    user: null,
  })
  const [viewModal, setViewModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [formState, setFormState] = useState<UserFormState>(emptyForm)

  const loadData = useCallback(async () => {
    if (!hasPermission) return
    setIsLoading(true)
    setError(null)
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        usersApi.getAll({ page: 1, pageSize: 500 }),
        usersApi.getRoles(),
      ])
      setAllUsers(usersResponse.data)
      setRoles(rolesResponse)
    } catch {
      setError('خطا در دریافت کاربران')
      toast.error('خطا در دریافت کاربران')
      setAllUsers([])
      setRoles([])
    } finally {
      setIsLoading(false)
    }
  }, [hasPermission])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filteredUsers = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    if (!q) return allUsers
    return allUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    )
  }, [allUsers, filters.search])

  const paginatedUsers = useMemo<PaginatedResponse<User>>(() => {
    const total = filteredUsers.length
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize))
    const page = Math.min(filters.page, totalPages)
    const start = (page - 1) * filters.pageSize
    const data = filteredUsers.slice(start, start + filters.pageSize)
    return {
      data,
      total,
      page,
      pageSize: filters.pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }
  }, [filteredUsers, filters.page, filters.pageSize])

  const openCreate = () => {
    setFormState({
      ...emptyForm,
      roleIds: roles[0]?.id ? [roles[0].id] : [],
    })
    setFormModal({ open: true, mode: 'create', user: null })
  }

  const openEdit = (user: User) => {
    setFormState({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      roleIds: user.roles?.map((role) => role.id) || [user.role.id],
      isActive: user.isActive,
      password: '',
    })
    setFormModal({ open: true, mode: 'edit', user })
  }

  const saveForm = () => {
    const fullName = formState.fullName.trim()
    const username = formState.username.trim()
    const email = formState.email.trim()
    const selectedRoles = roles.filter((role) => formState.roleIds.includes(role.id))
    const selectedRole = selectedRoles[0]
    if (!fullName || !username || !email || !selectedRole) {
      toast.error('لطفاً فیلدهای الزامی را کامل کنید')
      return
    }
    if (formModal.mode === 'create' && formState.password.length < 8) {
      toast.error('رمز عبور باید حداقل ۸ کاراکتر باشد')
      return
    }

    if (formModal.mode === 'create') {
      const newUser: User = {
        id: crypto.randomUUID(),
        username,
        email,
        phone: formState.phone || undefined,
        firstName: fullName.split(' ')[0] || fullName,
        lastName: fullName.split(' ').slice(1).join(' '),
        fullName,
        role: selectedRole,
        roles: selectedRoles,
        isActive: formState.isActive,
        isStaff: true,
        isSuperuser: selectedRole.codename === 'superadmin',
        dateJoined: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setAllUsers((prev) => [newUser, ...prev])
      toast.success('کاربر جدید ایجاد شد')
    } else if (formModal.user) {
      setAllUsers((prev) =>
        prev.map((user) =>
          user.id === formModal.user?.id
            ? {
                ...user,
                fullName,
                username,
                email,
                phone: formState.phone || undefined,
                firstName: fullName.split(' ')[0] || fullName,
                lastName: fullName.split(' ').slice(1).join(' '),
                role: selectedRole,
                roles: selectedRoles,
                isActive: formState.isActive,
                updatedAt: new Date().toISOString(),
              }
            : user,
        ),
      )
      toast.success('کاربر ویرایش شد')
    }

    setFormModal({ open: false, mode: 'create', user: null })
  }

  const handleDelete = () => {
    const target = deleteModal.user
    if (!target) return
    setAllUsers((prev) => prev.filter((user) => user.id !== target.id))
    setDeleteModal({ open: false, user: null })
    toast.success('کاربر حذف شد')
  }

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: 'نام',
        cell: ({ row }) => <span className="text-small font-medium">{row.original.fullName}</span>,
      },
      {
        accessorKey: 'username',
        header: 'نام کاربری',
        cell: ({ row }) => (
          <span className="text-small text-muted-foreground" dir="ltr">
            {row.original.username}
          </span>
        ),
      },
      {
        id: 'role',
        header: 'نقش',
        cell: ({ row }) => <Badge variant="outline">{row.original.role.name}</Badge>,
      },
      {
        id: 'active',
        header: 'وضعیت',
        cell: ({ row }) => <span className="text-small">{row.original.isActive ? 'فعال' : 'غیرفعال'}</span>,
      },
      {
        accessorKey: 'lastLogin',
        header: 'آخرین ورود',
        cell: ({ row }) => (
          <span className="text-small text-muted-foreground">
            {row.original.lastLogin ? formatJalaliDateTime(row.original.lastLogin) : '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'عملیات',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setViewModal({ open: true, user: row.original })}>
              <Eye className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openEdit(row.original)}>
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7"
              onClick={() => setDeleteModal({ open: true, user: row.original })}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [roles],
  )

  if (!hasPermission) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border p-8 text-center text-muted-foreground">
        فقط مدیر ارشد به فهرست کاربران دسترسی دارد.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>کاربران</h1>
          <p className="text-muted-foreground">مدیریت حساب‌های سامانه</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="me-2 size-4" />
          کاربر جدید
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={paginatedUsers.data}
        error={error}
        onRetry={loadData}
        searchPlaceholder="جستجو نام یا نام کاربری..."
        onSearch={(search) => setFilters((prev) => ({ ...prev, search, page: 1 }))}
        isLoading={isLoading}
        hasActiveFilters={Boolean(filters.search)}
        onClearFilters={() => setFilters((p) => ({ ...p, search: '', page: 1 }))}
        pagination={{
          page: paginatedUsers.page,
          pageSize: paginatedUsers.pageSize,
          total: paginatedUsers.total,
          totalPages: paginatedUsers.totalPages,
          onPageChange: (page) => setFilters((p) => ({ ...p, page })),
          onPageSizeChange: (pageSize) => setFilters((p) => ({ ...p, pageSize, page: 1 })),
        }}
        emptyState={{ title: 'کاربری یافت نشد' }}
        onRowClick={(row) => setViewModal({ open: true, user: row })}
      />

      <Dialog open={formModal.open} onOpenChange={(open) => setFormModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formModal.mode === 'create' ? 'ایجاد کاربر' : 'ویرایش کاربر'}</DialogTitle>
            <DialogDescription>اطلاعات کاربر را وارد کنید و سپس ذخیره را بزنید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نام کامل</Label>
              <Input value={formState.fullName} onChange={(e) => setFormState((prev) => ({ ...prev, fullName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>نام کاربری</Label>
              <Input value={formState.username} onChange={(e) => setFormState((prev) => ({ ...prev, username: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>ایمیل</Label>
              <Input type="email" value={formState.email} onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>تلفن</Label>
              <Input dir="ltr" value={formState.phone} onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>نقش‌ها</Label>
              <div className="grid gap-2 rounded-[var(--radius-md)] border border-border p-3">
                {roles.map((role) => {
                  const checked = formState.roleIds.includes(role.id)
                  return (
                    <label key={role.id} className="flex items-center gap-2 text-small">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            roleIds: event.target.checked
                              ? [...prev.roleIds, role.id]
                              : prev.roleIds.filter((id) => id !== role.id),
                          }))
                        }
                      />
                      {role.name}
                    </label>
                  )
                })}
              </div>
            </div>
            {formModal.mode === 'create' && (
              <div className="space-y-2">
                <Label>رمز عبور</Label>
                <Input
                  type="password"
                  value={formState.password}
                  onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                />
                <p className="text-caption text-muted-foreground">
                  قدرت رمز: {formState.password.length >= 12 ? 'قوی' : formState.password.length >= 8 ? 'متوسط' : 'ضعیف'}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2">
              <Label htmlFor="user-is-staff">دسترسی staff</Label>
              <span className="text-caption text-muted-foreground">بر اساس نقش تعیین می‌شود</span>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="user-active">فعال</Label>
              <Switch
                id="user-active"
                checked={formState.isActive}
                onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormModal({ open: false, mode: 'create', user: null })}>
              انصراف
            </Button>
            <Button onClick={saveForm}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewModal.open} onOpenChange={(open) => setViewModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جزئیات کاربر</DialogTitle>
            <DialogDescription>نمایش اطلاعات ثبت‌شده این کاربر.</DialogDescription>
          </DialogHeader>
          {viewModal.user ? (
            <div className="space-y-2 text-small">
              <p>نام: {viewModal.user.fullName}</p>
              <p dir="ltr">Username: {viewModal.user.username}</p>
              <p dir="ltr">Email: {viewModal.user.email}</p>
              <p>نقش: {viewModal.user.role.name}</p>
              <p>وضعیت: {viewModal.user.isActive ? 'فعال' : 'غیرفعال'}</p>
              <p>تاریخ عضویت: {formatJalaliDateTime(viewModal.user.dateJoined)}</p>
              <p>آخرین ورود: {viewModal.user.lastLogin ? formatJalaliDateTime(viewModal.user.lastLogin) : '—'}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModal({ open: false, user: null })}>
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, user: open ? deleteModal.user : null })}
        onConfirm={handleDelete}
        title={`حذف ${deleteModal.user?.fullName || 'کاربر'}`}
        itemName={deleteModal.user?.fullName}
      />
    </div>
  )
}
