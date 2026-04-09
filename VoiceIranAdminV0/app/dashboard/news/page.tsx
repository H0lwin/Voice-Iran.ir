'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal'
import apiClient from '@/lib/api/client'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDateTime, toPersianNumber } from '@/lib/utils/date'
import { STATUS_LABELS, type Post, type PaginatedResponse } from '@/lib/types'
import { toast } from 'sonner'

export default function NewsListPage() {
  const router = useRouter()
  const { canAdd, canChange, canDelete } = usePermission('news')

  const [data, setData] = useState<PaginatedResponse<Post> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
    pageSize: 10,
  })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; post: Post | null }>({
    open: false,
    post: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const loadData = useCallback(async () => {
    if (!isMountedRef.current) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.getPosts({
        search: filters.search,
        status: filters.status === 'all' ? undefined : filters.status,
        page: filters.page,
        pageSize: filters.pageSize,
      })
      if (!isMountedRef.current) return
      setData(response)
    } catch {
      if (!isMountedRef.current) return
      setError('خطا در دریافت اطلاعات')
      toast.error('خطا در دریافت اطلاعات')
    } finally {
      if (!isMountedRef.current) return
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleDelete = async () => {
    if (!deleteModal.post) return

    if (!isMountedRef.current) return
    setIsDeleting(true)
    try {
      await apiClient.deletePost(Number(deleteModal.post.id))
      if (!isMountedRef.current) return
      toast.success('خبر با موفقیت حذف شد')
      setDeleteModal({ open: false, post: null })
      await loadData()
    } catch {
      if (!isMountedRef.current) return
      toast.error('خطا در حذف خبر')
    } finally {
      if (!isMountedRef.current) return
      setIsDeleting(false)
    }
  }

  const handleSearch = useCallback((search: string) => {
    setFilters((prev) => {
      if (prev.search === search) return prev
      return { ...prev, search, page: 1 }
    })
  }, [])

  const handleStatusChange = useCallback((status: string) => {
    setFilters((prev) => {
      if (prev.status === status) return prev
      return { ...prev, status, page: 1 }
    })
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => {
      if (prev.page === page) return prev
      return { ...prev, page }
    })
  }, [])

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setFilters((prev) => {
      if (prev.pageSize === pageSize) return prev
      return { ...prev, pageSize, page: 1 }
    })
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters((prev) => ({
      search: '',
      status: 'all',
      page: 1,
      pageSize: prev.pageSize,
    }))
  }, [])

  const handleBulkDelete = useCallback((ids: string[]) => {
    Promise.all(ids.map((id) => apiClient.deletePost(Number(id))))
      .then(async () => {
        toast.success(`${toPersianNumber(ids.length)} خبر حذف شد`)
        await loadData()
      })
      .catch(() => toast.error('حذف گروهی ناموفق بود'))
  }, [loadData])

  const handleBulkPublish = useCallback((ids: string[]) => {
    Promise.all(ids.map((id) => apiClient.publishPost(Number(id))))
      .then(async () => {
        toast.success(`${toPersianNumber(ids.length)} خبر منتشر شد`)
        await loadData()
      })
      .catch(() => toast.error('انتشار گروهی ناموفق بود'))
  }, [loadData])

  const columns: ColumnDef<Post>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'عنوان',
        cell: ({ row }) => <p className="line-clamp-1 max-w-[360px] text-small font-medium">{row.original.title || row.original.slug}</p>,
      },
      {
        id: 'app',
        header: 'اپ',
        cell: () => <span className="text-small text-muted-foreground">اخبار</span>,
      },
      {
        accessorKey: 'view_count',
        header: 'بازدید',
        cell: ({ row }) => <span className="text-small">{row.original.viewCount || 0}</span>,
      },
      {
        accessorKey: 'created_at',
        header: 'تاریخ ایجاد',
        cell: ({ row }) => <span className="text-small text-muted-foreground">{formatJalaliDateTime(row.original.createdAt)}</span>,
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
            {canDelete && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-7"
                onClick={() => setDeleteModal({ open: true, post: row.original })}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" className="size-7" asChild>
              <Link href={`/dashboard/news/${row.original.id}`}>
                <Eye className="size-4" />
              </Link>
            </Button>
            {canChange && (
              <Button variant="ghost" size="icon-sm" className="size-7" asChild>
                <Link href={`/dashboard/news/${row.original.id}`}>
                  <Pencil className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        ),
      },
    ],
    [canChange, canDelete],
  )

  const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))
  const hasActiveFilters = Boolean(filters.search || filters.status !== 'all')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>اخبار</h1>
          <p className="text-muted-foreground">مدیریت اخبار و مطالب خبری</p>
        </div>
        {canAdd && (
          <Button asChild>
            <Link href="/dashboard/news/new">
              <Plus className="me-2 size-4" />
              خبر جدید
            </Link>
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        appName="news"
        onSearch={handleSearch}
        onBulkDelete={canDelete ? handleBulkDelete : undefined}
        onBulkPublish={canChange ? handleBulkPublish : undefined}
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
          title: 'هنوز هیچ موردی وجود ندارد',
          description: 'برای شروع اولین خبر را ایجاد کنید',
          action: canAdd
            ? {
                label: 'ایجاد اولین مورد',
                onClick: () => router.push('/dashboard/news/new'),
              }
            : undefined,
        }}
        onRowClick={(row) => router.push(`/dashboard/news/${row.id}`)}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, post: open ? deleteModal.post : null })}
        onConfirm={handleDelete}
        title={`حذف ${deleteModal.post?.title || deleteModal.post?.slug || 'خبر'}`}
        itemName={deleteModal.post?.title || deleteModal.post?.slug}
        isLoading={isDeleting}
      />
    </div>
  )
}
