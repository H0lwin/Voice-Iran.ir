'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal'
import { formatJalaliDateTime } from '@/lib/utils/date'
import { STATUS_LABELS, type AppName, type ContentStatus, type FilterParams, type PaginatedResponse } from '@/lib/types'
import { usePermission } from '@/lib/auth/use-permission'
import { toast } from 'sonner'

type LibraryApp = Extract<AppName, 'arsenal' | 'martyrs' | 'documents' | 'achievements'>

export type LibraryRow = {
  id: string
  title: string
  status: ContentStatus
  createdAt: string
  author: { fullName: string }
}

interface ContentLibraryListProps<T extends LibraryRow> {
  app: LibraryApp
  title: string
  description: string
  typeLabel: string
  fetchAll: (filters: FilterParams) => Promise<PaginatedResponse<T>>
  basePath: string
  categoryLabel?: string
  getCategoryLabel?: (row: T) => string | undefined
}

export function ContentLibraryList<T extends LibraryRow>({
  app,
  title,
  description,
  typeLabel,
  fetchAll,
  basePath,
  categoryLabel = 'دسته',
  getCategoryLabel,
}: ContentLibraryListProps<T>) {
  const router = useRouter()
  const { canView, canAdd, canChange, canDelete } = usePermission(app)
  const [data, setData] = useState<PaginatedResponse<T> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: T | null }>({ open: false, item: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
    pageSize: 10,
  })

  const loadData = useCallback(async () => {
    if (!canView) {
      setData(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetchAll({
        search: filters.search,
        status: filters.status === 'all' ? undefined : filters.status,
        page: filters.page,
        pageSize: filters.pageSize,
      })
      const filteredData = response.data.filter((row) => !deletedIds.has(row.id))
      setData({
        ...response,
        data: filteredData,
        total: Math.max(response.total - deletedIds.size, 0),
      })
    } catch {
      setError('خطا در دریافت اطلاعات')
      toast.error('خطا در دریافت اطلاعات')
    } finally {
      setIsLoading(false)
    }
  }, [canView, deletedIds, fetchAll, filters])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleSearch = useCallback((search: string) => {
    setFilters((prev) => (prev.search === search ? prev : { ...prev, search, page: 1 }))
  }, [])

  const handleStatusChange = useCallback((status: string) => {
    setFilters((prev) => (prev.status === status ? prev : { ...prev, status, page: 1 }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => (prev.page === page ? prev : { ...prev, page }))
  }, [])

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setFilters((prev) => (prev.pageSize === pageSize ? prev : { ...prev, pageSize, page: 1 }))
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters((prev) => ({
      search: '',
      status: 'all',
      page: 1,
      pageSize: prev.pageSize,
    }))
  }, [])

  const columns: ColumnDef<T>[] = useMemo(() => {
    const base: ColumnDef<T>[] = [
      {
        accessorKey: 'title',
        header: 'عنوان',
        cell: ({ row }) => <p className="line-clamp-1 max-w-[360px] text-small font-medium">{row.original.title}</p>,
      },
    ]
    if (getCategoryLabel) {
      base.push({
        id: 'category',
        header: categoryLabel,
        cell: ({ row }) => (
          <span className="text-small text-muted-foreground">{getCategoryLabel(row.original) || '—'}</span>
        ),
      })
    }
    base.push(
      {
        id: 'app',
        header: 'اپ',
        cell: () => <span className="text-small text-muted-foreground">{typeLabel}</span>,
      },
      {
        accessorKey: 'author',
        header: 'نویسنده',
        cell: ({ row }) => <span className="text-small">{row.original.author.fullName}</span>,
      },
      {
        accessorKey: 'createdAt',
        header: 'تاریخ ایجاد',
        cell: ({ row }) => (
          <span className="text-small text-muted-foreground">{formatJalaliDateTime(row.original.createdAt)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'وضعیت',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'عملیات',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <Button variant="ghost" size="icon-sm" className="size-7" asChild>
              <Link href={`${basePath}/${row.original.id}`}>
                <Eye className="size-4" />
              </Link>
            </Button>
            {canChange && (
              <Button variant="ghost" size="icon-sm" className="size-7" asChild>
                <Link href={`${basePath}/${row.original.id}`}>
                  <Pencil className="size-4" />
                </Link>
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-7"
                onClick={() => setDeleteModal({ open: true, item: row.original })}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        ),
      },
    )
    return base
  }, [basePath, canChange, canDelete, categoryLabel, getCategoryLabel, typeLabel])

  const handleDelete = () => {
    const target = deleteModal.item
    if (!target || !data) return
    setIsDeleting(true)
    setDeletedIds((prev) => new Set([...prev, target.id]))
    setData((prev) =>
      prev
        ? {
            ...prev,
            data: prev.data.filter((item) => item.id !== target.id),
            total: Math.max(prev.total - 1, 0),
          }
        : prev,
    )
    setDeleteModal({ open: false, item: null })
    setIsDeleting(false)
    toast.success(`${typeLabel} با موفقیت حذف شد`)
  }

  const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))
  const hasActiveFilters = Boolean(filters.search || filters.status !== 'all')

  if (!canView) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border p-8 text-center text-muted-foreground">
        دسترسی به این بخش برای نقش شما فعال نیست.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {canAdd ? (
          <Button asChild>
            <Link href={`${basePath}/new`}>
              <Plus className="me-2 size-4" />
              {`ایجاد ${typeLabel}`}
            </Link>
          </Button>
        ) : null}
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        appName={app}
        onSearch={handleSearch}
        statusFilter={{
          value: filters.status,
          onChange: handleStatusChange,
          options: statusOptions,
        }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        pagination={
          data
            ? {
                page: data.page,
                pageSize: data.pageSize,
                total: data.total,
                totalPages: data.totalPages,
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange,
              }
            : undefined
        }
        emptyState={{
          title: 'موردی یافت نشد',
          description: 'با فیلترهای دیگر جستجو کنید یا بعداً دوباره تلاش کنید.',
        }}
        onRowClick={(row) => router.push(`${basePath}/${row.id}`)}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, item: open ? deleteModal.item : null })}
        onConfirm={handleDelete}
        title={`حذف ${deleteModal.item?.title || typeLabel}`}
        itemName={deleteModal.item?.title}
        isLoading={isDeleting}
      />
    </div>
  )
}
