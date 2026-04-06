'use client'

import { useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { profilesApi } from '@/lib/api/api-client'
import { AppAccessSelector } from '@/components/dashboard/accounts/app-access-selector'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDateTime } from '@/lib/utils/date'
import type { AccessProfile } from '@/lib/types'
import { toast } from 'sonner'

type ProfileFormState = {
  name: string
  description: string
  roleId: string
  canPublish: boolean
  canDelete: boolean
  canManageUsers: boolean
  canViewAudit: boolean
  allowedApps: string[]
  deniedApps: string[]
}

const emptyForm: ProfileFormState = {
  name: '',
  description: '',
  roleId: '',
  canPublish: false,
  canDelete: false,
  canManageUsers: false,
  canViewAudit: false,
  allowedApps: [],
  deniedApps: [],
}

export default function AccessProfilesPage() {
  const { hasPermission } = usePermission('accounts')
  const [profiles, setProfiles] = useState<AccessProfile[]>([])
  const [apps, setApps] = useState<{ id: string; label: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', page: 1, pageSize: 10 })
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'create' | 'edit'; profile: AccessProfile | null }>({
    open: false,
    mode: 'create',
    profile: null,
  })
  const [viewModal, setViewModal] = useState<{ open: boolean; profile: AccessProfile | null }>({ open: false, profile: null })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; profile: AccessProfile | null }>({ open: false, profile: null })
  const [formState, setFormState] = useState<ProfileFormState>(emptyForm)

  useEffect(() => {
    if (!hasPermission) return
    Promise.all([profilesApi.getAll(), profilesApi.getAppList()])
      .then(([profilesData, appsData]) => {
        setProfiles(profilesData)
        setApps(appsData)
      })
      .catch(() => {
        toast.error('خطا در دریافت پروفایل‌ها')
        setProfiles([])
        setApps([])
      })
      .finally(() => setIsLoading(false))
  }, [hasPermission])

  const filteredProfiles = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    if (!q) return profiles
    return profiles.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q),
    )
  }, [filters.search, profiles])

  const pagedProfiles = useMemo(() => {
    const total = filteredProfiles.length
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize))
    const page = Math.min(filters.page, totalPages)
    const start = (page - 1) * filters.pageSize
    return {
      data: filteredProfiles.slice(start, start + filters.pageSize),
      total,
      page,
      pageSize: filters.pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }
  }, [filteredProfiles, filters.page, filters.pageSize])

  const openCreate = () => {
    setFormState(emptyForm)
    setFormModal({ open: true, mode: 'create', profile: null })
  }

  const openEdit = (profile: AccessProfile) => {
    setFormState({
      name: profile.name,
      description: profile.description || '',
      roleId: profile.roleId || '',
      canPublish: Boolean(profile.canPublish),
      canDelete: Boolean(profile.canDelete),
      canManageUsers: Boolean(profile.canManageUsers),
      canViewAudit: Boolean(profile.canViewAudit),
      allowedApps: profile.allowedApps,
      deniedApps: profile.deniedApps,
    })
    setFormModal({ open: true, mode: 'edit', profile })
  }

  const saveForm = () => {
    const name = formState.name.trim()
    if (!name) {
      toast.error('نام پروفایل الزامی است')
      return
    }
    const payload = {
      name,
      description: formState.description.trim() || undefined,
      roleId: formState.roleId || undefined,
      canPublish: formState.canPublish,
      canDelete: formState.canDelete,
      canManageUsers: formState.canManageUsers,
      canViewAudit: formState.canViewAudit,
      allowedApps: formState.allowedApps,
      deniedApps: formState.deniedApps,
    }
    if (formModal.mode === 'create') {
      const newProfile: AccessProfile = {
        id: crypto.randomUUID(),
        name: payload.name,
        description: payload.description,
        allowedApps: payload.allowedApps,
        deniedApps: payload.deniedApps,
        customPermissions: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setProfiles((prev) => [newProfile, ...prev])
      toast.success('پروفایل دسترسی ایجاد شد')
    } else if (formModal.profile) {
      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === formModal.profile?.id
            ? {
                ...profile,
                ...payload,
                updatedAt: new Date().toISOString(),
              }
            : profile,
        ),
      )
      toast.success('پروفایل دسترسی ویرایش شد')
    }
    setFormModal({ open: false, mode: 'create', profile: null })
  }

  const deleteProfile = () => {
    if (!deleteModal.profile) return
    setProfiles((prev) => prev.filter((profile) => profile.id !== deleteModal.profile?.id))
    setDeleteModal({ open: false, profile: null })
    toast.success('پروفایل حذف شد')
  }

  const columns: ColumnDef<AccessProfile>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'نام پروفایل',
        cell: ({ row }) => <span className="text-small font-medium">{row.original.name}</span>,
      },
      {
        id: 'allowed',
        header: 'اپ‌های مجاز',
        cell: ({ row }) => <Badge variant="secondary">{row.original.allowedApps.length.toLocaleString('fa-IR')}</Badge>,
      },
      {
        id: 'denied',
        header: 'اپ‌های مستثنی',
        cell: ({ row }) => <Badge variant="outline">{row.original.deniedApps.length.toLocaleString('fa-IR')}</Badge>,
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
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setViewModal({ open: true, profile: row.original })}>
              <Eye className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openEdit(row.original)}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => setDeleteModal({ open: true, profile: row.original })}>
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
        فقط مدیر ارشد به سطوح دسترسی پیشرفته دسترسی دارد.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>سطوح دسترسی</h1>
          <p className="text-muted-foreground">پروفایل‌های ترکیبی اپلیکیشن‌ها برای تخصیص به کاربران</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="me-2 size-4" />
          پروفایل جدید
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={pagedProfiles.data}
        isLoading={isLoading}
        onSearch={(search) => setFilters((prev) => ({ ...prev, search, page: 1 }))}
        hasActiveFilters={Boolean(filters.search)}
        onClearFilters={() => setFilters((prev) => ({ ...prev, search: '', page: 1 }))}
        pagination={{
          page: pagedProfiles.page,
          pageSize: pagedProfiles.pageSize,
          total: pagedProfiles.total,
          totalPages: pagedProfiles.totalPages,
          onPageChange: (page) => setFilters((prev) => ({ ...prev, page })),
          onPageSizeChange: (pageSize) => setFilters((prev) => ({ ...prev, pageSize, page: 1 })),
        }}
        emptyState={{ title: 'پروفایلی ثبت نشده است' }}
        onRowClick={(row) => setViewModal({ open: true, profile: row })}
      />

      <Dialog open={formModal.open} onOpenChange={(open) => setFormModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="w-[calc(100%-1rem)] max-h-[90vh] max-w-4xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-4 py-3 md:px-6">
            <DialogTitle>{formModal.mode === 'create' ? 'ایجاد پروفایل دسترسی' : 'ویرایش پروفایل دسترسی'}</DialogTitle>
            <DialogDescription>اپ‌های مجاز را انتخاب کنید. موارد انتخاب‌نشده مستثنی خواهند شد.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-4 py-4 md:px-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>نام پروفایل</Label>
                <Input value={formState.name} onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>توضیحات</Label>
                <Input value={formState.description} onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2 text-small">
                اجازه انتشار
                <input
                  type="checkbox"
                  checked={formState.canPublish}
                  onChange={(e) => setFormState((prev) => ({ ...prev, canPublish: e.target.checked }))}
                />
              </label>
              <label className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2 text-small">
                اجازه حذف
                <input
                  type="checkbox"
                  checked={formState.canDelete}
                  onChange={(e) => setFormState((prev) => ({ ...prev, canDelete: e.target.checked }))}
                />
              </label>
              <label className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2 text-small">
                مدیریت کاربران
                <input
                  type="checkbox"
                  checked={formState.canManageUsers}
                  onChange={(e) => setFormState((prev) => ({ ...prev, canManageUsers: e.target.checked }))}
                />
              </label>
              <label className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2 text-small">
                مشاهده لاگ‌ها
                <input
                  type="checkbox"
                  checked={formState.canViewAudit}
                  onChange={(e) => setFormState((prev) => ({ ...prev, canViewAudit: e.target.checked }))}
                />
              </label>
            </div>
            <div className="mt-4 space-y-2">
              <Label>اپلیکیشن‌ها</Label>
              <AppAccessSelector
                apps={apps}
                allowedApps={formState.allowedApps}
                onChange={({ allowedApps, deniedApps }) =>
                  setFormState((prev) => ({ ...prev, allowedApps, deniedApps }))
                }
              />
            </div>
          </div>
          <DialogFooter className="border-t border-border px-4 py-3 md:px-6">
            <Button variant="outline" onClick={() => setFormModal({ open: false, mode: 'create', profile: null })}>
              انصراف
            </Button>
            <Button onClick={saveForm}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewModal.open} onOpenChange={(open) => setViewModal((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جزئیات پروفایل دسترسی</DialogTitle>
            <DialogDescription>نمایش اپ‌های مجاز و مستثنی این پروفایل.</DialogDescription>
          </DialogHeader>
          {viewModal.profile ? (
            <div className="space-y-3 text-small">
              <p>نام: {viewModal.profile.name}</p>
              <p>اپ‌های مجاز: {viewModal.profile.allowedApps.join('، ') || '—'}</p>
              <p>اپ‌های مستثنی: {viewModal.profile.deniedApps.join('، ') || '—'}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModal({ open: false, profile: null })}>
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, profile: open ? deleteModal.profile : null })}
        onConfirm={deleteProfile}
        title={`حذف ${deleteModal.profile?.name || 'پروفایل'}`}
        itemName={deleteModal.profile?.name}
      />
    </div>
  )
}
