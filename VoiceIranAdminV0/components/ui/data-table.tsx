'use client'

import { useEffect, useMemo, useState, useRef, type MouseEvent } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import { Search, X, Trash2, Check, Filter, RotateCcw, RefreshCw } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import { toPersianNumber } from '@/lib/utils/date'

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  appName?: 'news' | 'arsenal' | 'martyrs' | 'documents' | 'achievements'
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  onBulkDelete?: (ids: string[]) => void
  onBulkPublish?: (ids: string[]) => void
  onBulkArchive?: (ids: string[]) => void
  statusFilter?: {
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
  }
  appFilter?: {
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
  }
  dateFilter?: {
    from?: string
    to?: string
    onFromChange: (value: string) => void
    onToChange: (value: string) => void
  }
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  }
  emptyState?: {
    title: string
    description?: string
    action?: {
      label: string
      onClick: () => void
    }
  }
  onRowClick?: (row: T) => void
}

const APP_PLACEHOLDERS: Record<NonNullable<DataTableProps<never>['appName']>, string> = {
  news: 'جستجو در اخبار...',
  arsenal: 'جستجو در تسلیحات...',
  martyrs: 'جستجو در شهداء...',
  documents: 'جستجو در اسناد...',
  achievements: 'جستجو در دستاوردها...',
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  error,
  onRetry,
  appName,
  searchPlaceholder,
  onSearch,
  onBulkDelete,
  onBulkPublish,
  onBulkArchive,
  statusFilter,
  appFilter,
  dateFilter,
  hasActiveFilters = false,
  onClearFilters,
  pagination,
  emptyState,
  onRowClick,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [searchValue, setSearchValue] = useState('')
  const isFirstRender = useRef(true)
  const onSearchRef = useRef(onSearch)

  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => onSearchRef.current?.(searchValue), 300)
    return () => clearTimeout(timer)
  }, [searchValue])

  const columnsWithSelection = useMemo<ColumnDef<T>[]>(() => {
    if (!onBulkDelete && !onBulkPublish && !onBulkArchive) return columns

    return [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex w-[44px] justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                  ? 'indeterminate'
                  : false
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="انتخاب همه"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex w-[44px] justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="انتخاب ردیف"
            />
          </div>
        ),
        enableSorting: false,
      },
      ...columns,
    ]
  }, [columns, onBulkArchive, onBulkDelete, onBulkPublish])

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableSortingRemoval: true,
    state: { sorting, rowSelection },
  })

  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id)

  const filterPlaceholder = searchPlaceholder || (appName ? APP_PLACEHOLDERS[appName] : 'جستجو...')

  const clearSelection = () => setRowSelection({})

  const handleSortClick = (header: ReturnType<typeof table.getHeaderGroups>[number]['headers'][number]) => {
    if (!header.column.getCanSort()) return
    const current = header.column.getIsSorted()
    if (current === false) {
      header.column.toggleSorting(false)
      return
    }
    if (current === 'asc') {
      header.column.toggleSorting(true)
      return
    }
    table.setSorting((prev) => prev.filter((item) => item.id !== header.column.id))
  }

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>, rowData: T) => {
    if (!onRowClick) return
    const target = event.target as HTMLElement
    const interactiveElement = target.closest(
      'button, a, input, textarea, select, [role="checkbox"], [data-row-click-ignore="true"]',
    )
    if (interactiveElement) return
    onRowClick(rowData)
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-muted px-3 py-2">
          <div className="text-small">
            {toPersianNumber(selectedIds.length)} مورد انتخاب شده است
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            {onBulkDelete && (
              <Button variant="destructive" size="sm" onClick={() => onBulkDelete(selectedIds)}>
                <Trash2 className="me-1 size-4" />
                حذف گروهی
              </Button>
            )}
            {onBulkPublish && (
              <Button variant="outline" size="sm" onClick={() => onBulkPublish(selectedIds)}>
                <Check className="me-1 size-4" />
                انتشار گروهی
              </Button>
            )}
            {onBulkArchive && (
              <Button variant="outline" size="sm" onClick={() => onBulkArchive(selectedIds)}>
                آرشیو گروهی
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              لغو انتخاب
            </Button>
          </div>
          <div className="sm:hidden">
            <Select
              onValueChange={(value) => {
                if (value === 'delete' && onBulkDelete) onBulkDelete(selectedIds)
                if (value === 'publish' && onBulkPublish) onBulkPublish(selectedIds)
                if (value === 'archive' && onBulkArchive) onBulkArchive(selectedIds)
                if (value === 'clear') clearSelection()
              }}
            >
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="اقدامات گروهی" />
              </SelectTrigger>
              <SelectContent>
                {onBulkDelete && <SelectItem value="delete">حذف گروهی</SelectItem>}
                {onBulkPublish && <SelectItem value="publish">تغییر وضعیت</SelectItem>}
                {onBulkArchive && <SelectItem value="archive">آرشیو گروهی</SelectItem>}
                <SelectItem value="clear">لغو انتخاب</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative min-w-[220px] flex-1 md:max-w-sm">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={filterPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pe-9 ps-8"
            />
            {searchValue && (
              <button
                type="button"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setSearchValue('')}
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {statusFilter && (
            <Select value={statusFilter.value} onValueChange={statusFilter.onChange}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                {statusFilter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {appFilter && (
            <Select value={appFilter.value} onValueChange={appFilter.onChange}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="اپ" />
              </SelectTrigger>
              <SelectContent>
                {appFilter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {dateFilter && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="h-9 w-[150px]"
                value={dateFilter.from || ''}
                onChange={(e) => dateFilter.onFromChange(e.target.value)}
                aria-label="از"
              />
              <Input
                type="date"
                className="h-9 w-[150px]"
                value={dateFilter.to || ''}
                onChange={(e) => dateFilter.onToChange(e.target.value)}
                aria-label="تا"
              />
            </div>
          )}

          {hasActiveFilters && onClearFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <RotateCcw className="me-1 size-4" />
              پاک کردن فیلترها
            </Button>
          )}
        </div>
      )}

      {error ? (
        <div className="rounded-[var(--radius-md)] border border-destructive/30 bg-destructive/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-destructive">
            <Filter className="size-4" />
            خطا در دریافت اطلاعات
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="me-1 size-4" />
              تلاش مجدد
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted()
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'h-11 text-small',
                          header.column.getCanSort() && 'cursor-pointer select-none',
                        )}
                        onClick={() => handleSortClick(header)}
                      >
                        <div className="flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-muted-foreground">
                              {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '↕'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {columnsWithSelection.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columnsWithSelection.length} className="h-52">
                    <Empty>
                      <EmptyContent>
                        <EmptyTitle>
                          {hasActiveFilters
                            ? 'موردی با این فیلترها یافت نشد'
                            : emptyState?.title || 'هنوز هیچ موردی ثبت نشده است'}
                        </EmptyTitle>
                        {hasActiveFilters ? null : emptyState?.description ? (
                          <EmptyDescription>{emptyState.description}</EmptyDescription>
                        ) : null}
                        {hasActiveFilters && onClearFilters ? (
                          <Button variant="ghost" onClick={onClearFilters}>
                            پاک کردن فیلترها
                          </Button>
                        ) : (
                          emptyState?.action && (
                            <Button onClick={emptyState.action.onClick}>{emptyState.action.label}</Button>
                          )
                        )}
                      </EmptyContent>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'group hover:bg-[#F8FAFC] dark:hover:bg-[#162033]',
                      onRowClick && 'cursor-pointer',
                      row.getIsSelected() && 'bg-[#EAF1F8] dark:bg-[#1B2A40]',
                    )}
                    onClick={(event) => handleRowClick(event, row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination && pagination.total > 0 && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-small text-muted-foreground">
            نمایش {toPersianNumber((pagination.page - 1) * pagination.pageSize + 1)} تا{' '}
            {toPersianNumber(
              Math.min(pagination.page * pagination.pageSize, pagination.total),
            )}{' '}
            از {toPersianNumber(pagination.total)} مورد
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page <= 1}
            >
              اول
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              قبلی
            </Button>
            <span className="px-2 text-small">{toPersianNumber(pagination.page)}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              بعدی
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages}
            >
              آخر
            </Button>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => pagination.onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-9 w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {toPersianNumber(size)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
