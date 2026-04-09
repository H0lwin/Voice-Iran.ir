'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { Check, X, Eye, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import apiClient from '@/lib/api/client'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDateTime } from '@/lib/utils/date'
import type { Achievement, PaginatedResponse } from '@/lib/types'
import { toast } from 'sonner'

export default function AchievementsListPage() {
  const { canChange, canPublish } = usePermission('achievements')
  const [data, setData] = useState<PaginatedResponse<Achievement> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', status: 'all', verificationStatus: 'all', page: 1, pageSize: 10 })

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getAchievements({
        search: filters.search,
        status: filters.status === 'all' ? undefined : filters.status,
        page: filters.page,
        pageSize: filters.pageSize,
      })
      const filtered = response.data.filter((item) =>
        filters.verificationStatus === 'all' ? true : (item.verificationStatus || 'pending') === filters.verificationStatus,
      )
      setData({ ...response, data: filtered, total: filtered.length, totalPages: Math.max(1, Math.ceil(filtered.length / filters.pageSize)) })
    } catch {
      toast.error('خطا در دریافت دستاوردها')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [filters.page, filters.pageSize, filters.search, filters.status, filters.verificationStatus])

  useEffect(() => {
    void load()
  }, [load])

  const updateVerification = async (row: Achievement, status: 'verified' | 'rejected') => {
    try {
      await apiClient.updateAchievement(Number(row.id), {
        verificationStatus: status,
        status: status === 'verified' ? 'published' : row.status,
      })
      toast.success(status === 'verified' ? 'دستاورد تأیید شد' : 'دستاورد رد شد')
      await load()
    } catch {
      toast.error('خطا در بروزرسانی')
    }
  }

  const columns: ColumnDef<Achievement>[] = useMemo(
    () => [
      { accessorKey: 'title', header: 'عنوان', cell: ({ row }) => <p className="line-clamp-1 max-w-[280px] text-small font-medium">{row.original.title || row.original.slug}</p> },
      { accessorKey: 'status', header: 'وضعیت', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: 'verificationStatus',
        header: 'تأیید',
        cell: ({ row }) => {
          const status = row.original.verificationStatus || 'pending'
          return <span className="text-small">{status === 'verified' ? 'تأیید شده' : status === 'rejected' ? 'رد شده' : 'در انتظار'}</span>
        },
      },
      {
        accessorKey: 'created_at',
        header: 'تاریخ',
        cell: ({ row }) => <span className="text-small text-muted-foreground">{formatJalaliDateTime(row.original.createdAt)}</span>,
      },
      {
        id: 'actions',
        header: 'عملیات',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href={`/dashboard/achievements/${row.original.id}`}><Eye className="size-4" /></Link>
            </Button>
            {canChange && (
              <Button variant="ghost" size="icon-sm" asChild>
                <Link href={`/dashboard/achievements/${row.original.id}`}><Pencil className="size-4" /></Link>
              </Button>
            )}
            {canPublish && (
              <>
                <Button variant="ghost" size="icon-sm" onClick={() => void updateVerification(row.original, 'verified')}>
                  <Check className="size-4 text-success" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => void updateVerification(row.original, 'rejected')}>
                  <X className="size-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [canChange, canPublish],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>دستاوردها</h1>
          <p className="text-muted-foreground">مدیریت و تأیید دستاوردها</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/achievements/new">دستاورد جدید</Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        onSearch={(search) => setFilters((prev) => ({ ...prev, search, page: 1 }))}
        statusFilter={{
          value: filters.status,
          onChange: (status) => setFilters((prev) => ({ ...prev, status, page: 1 })),
          options: [
            { value: 'draft', label: 'پیش‌نویس' },
            { value: 'pending_review', label: 'در انتظار بررسی' },
            { value: 'published', label: 'منتشرشده' },
            { value: 'archived', label: 'آرشیو' },
          ],
        }}
        appFilter={{
          value: filters.verificationStatus,
          onChange: (verificationStatus) => setFilters((prev) => ({ ...prev, verificationStatus, page: 1 })),
          options: [
            { value: 'all', label: 'همه تأییدها' },
            { value: 'pending', label: 'در انتظار' },
            { value: 'verified', label: 'تأیید شده' },
            { value: 'rejected', label: 'رد شده' },
          ],
        }}
        pagination={
          data
            ? {
                page: filters.page,
                pageSize: filters.pageSize,
                total: data.total,
                totalPages: data.totalPages,
                onPageChange: (page) => setFilters((prev) => ({ ...prev, page })),
                onPageSizeChange: (pageSize) => setFilters((prev) => ({ ...prev, pageSize, page: 1 })),
              }
            : undefined
        }
        emptyState={{ title: 'دستاوردی یافت نشد' }}
      />
    </div>
  )
}
