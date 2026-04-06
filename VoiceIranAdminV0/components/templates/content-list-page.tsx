'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Trash2, Eye, Edit, MoreHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/ui/status-badge'
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePermission } from '@/lib/auth/use-permission'
import { formatJalaliDate, formatPersianNumber } from '@/lib/utils/date'
import { toast } from 'sonner'
import type { AppName, ContentStatus, PaginatedResponse } from '@/lib/types'

interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  cell: (item: T) => React.ReactNode
  className?: string
}

interface ContentListPageProps<T> {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  appName: AppName
  basePath: string
  columns: Column<T>[]
  fetchData: (params: {
    page: number
    search?: string
    status?: ContentStatus | 'all'
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => Promise<PaginatedResponse<T>>
  deleteItem: (id: string) => Promise<void>
  bulkDelete?: (ids: string[]) => Promise<void>
  getItemId: (item: T) => string
  getItemTitle: (item: T) => string
  statusOptions?: { value: ContentStatus | 'all'; label: string }[]
}

const defaultStatusOptions: { value: ContentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'همه' },
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'pending_review', label: 'در بررسی' },
  { value: 'published', label: 'منتشرشده' },
  { value: 'rejected', label: 'رد شده' },
]

export function ContentListPage<T>({
  title,
  description,
  icon: Icon,
  appName,
  basePath,
  columns,
  fetchData,
  deleteItem,
  bulkDelete,
  getItemId,
  getItemTitle,
  statusOptions = defaultStatusOptions,
}: ContentListPageProps<T>) {
  const router = useRouter()
  const { canAdd, canChange, canDelete } = usePermission(appName)
  
  const [data, setData] = useState<T[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item?: T; isBulk?: boolean }>({
    open: false,
  })

  const pageSize = 10

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await fetchData({
        page: currentPage,
        search: searchQuery || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy,
        sortOrder,
      })
      setData(result.data)
      setTotalCount(result.total)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('خطا در بارگذاری اطلاعات')
    } finally {
      setIsLoading(false)
    }
  }, [fetchData, currentPage, searchQuery, statusFilter, sortBy, sortOrder])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortOrder('desc')
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(data.map(getItemId))
    }
  }

  const handleSelectItem = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleDelete = async () => {
    if (!deleteModal.item && !deleteModal.isBulk) return

    try {
      if (deleteModal.isBulk && bulkDelete) {
        await bulkDelete(selectedIds)
        toast.success(`${formatPersianNumber(selectedIds.length)} مورد حذف شد`)
        setSelectedIds([])
      } else if (deleteModal.item) {
        await deleteItem(getItemId(deleteModal.item))
        toast.success('مورد با موفقیت حذف شد')
      }
      loadData()
    } catch (error) {
      console.error('Failed to delete:', error)
      toast.error('خطا در حذف')
    } finally {
      setDeleteModal({ open: false })
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        {canAdd && (
          <Button asChild>
            <Link href={`${basePath}/new`}>
              <Plus className="me-2 size-4" />
              ایجاد جدید
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="جستجو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pe-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ContentStatus | 'all')}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                }}
              >
                پاک کردن فیلترها
              </Button>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="mt-4 flex items-center gap-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {formatPersianNumber(selectedIds.length)} مورد انتخاب شده
              </span>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                لغو انتخاب
              </Button>
              {canDelete && bulkDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteModal({ open: true, isBulk: true })}
                >
                  <Trash2 className="me-2 size-4" />
                  حذف انتخاب‌شده‌ها
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton columns={columns.length + 2} />
          ) : data.length === 0 ? (
            <div className="py-12 text-center">
              <Icon className="mx-auto size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">
                {searchQuery || statusFilter !== 'all'
                  ? 'نتیجه‌ای یافت نشد'
                  : 'هنوز موردی ثبت نشده'}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'فیلترها را تغییر دهید یا عبارت جستجو را اصلاح کنید'
                  : 'برای شروع، اولین مورد را ایجاد کنید'}
              </p>
              {canAdd && !searchQuery && statusFilter === 'all' && (
                <Button asChild>
                  <Link href={`${basePath}/new`}>
                    <Plus className="me-2 size-4" />
                    ایجاد اولین مورد
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === data.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    {columns.map((col) => (
                      <TableHead
                        key={col.key}
                        className={col.className}
                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        style={col.sortable ? { cursor: 'pointer' } : undefined}
                      >
                        <span className="flex items-center gap-1">
                          {col.header}
                          {col.sortable && sortBy === col.key && (
                            <span className="text-xs">
                              {sortOrder === 'asc' ? '▲' : '▼'}
                            </span>
                          )}
                        </span>
                      </TableHead>
                    ))}
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => {
                    const id = getItemId(item)
                    return (
                      <TableRow
                        key={id}
                        className={selectedIds.includes(id) ? 'bg-muted/50' : undefined}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(id)}
                            onCheckedChange={() => handleSelectItem(id)}
                          />
                        </TableCell>
                        {columns.map((col) => (
                          <TableCell key={col.key} className={col.className}>
                            {col.cell(item)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`${basePath}/${id}`)}
                              >
                                <Eye className="me-2 size-4" />
                                مشاهده
                              </DropdownMenuItem>
                              {canChange && (
                                <DropdownMenuItem
                                  onClick={() => router.push(`${basePath}/${id}`)}
                                >
                                  <Edit className="me-2 size-4" />
                                  ویرایش
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeleteModal({ open: true, item })}
                                  >
                                    <Trash2 className="me-2 size-4" />
                                    حذف
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  نمایش {formatPersianNumber((currentPage - 1) * pageSize + 1)} تا{' '}
                  {formatPersianNumber(Math.min(currentPage * pageSize, totalCount))} از{' '}
                  {formatPersianNumber(totalCount)} مورد
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    اول
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                  >
                    قبلی
                  </Button>
                  <span className="text-sm px-2">
                    صفحه {formatPersianNumber(currentPage)} از {formatPersianNumber(totalPages)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                  >
                    بعدی
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    آخر
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open })}
        onConfirm={handleDelete}
        title={
          deleteModal.isBulk
            ? `حذف ${formatPersianNumber(selectedIds.length)} مورد`
            : deleteModal.item
            ? `حذف "${getItemTitle(deleteModal.item)}"`
            : 'حذف'
        }
        description={
          deleteModal.isBulk
            ? `آیا از حذف ${formatPersianNumber(selectedIds.length)} مورد انتخاب‌شده اطمینان دارید؟`
            : 'این عملیات قابل بازگشت نیست.'
        }
      />
    </div>
  )
}

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton
              key={j}
              className={`h-8 ${j === 0 ? 'w-8' : j === columns - 1 ? 'w-8' : 'flex-1'}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
