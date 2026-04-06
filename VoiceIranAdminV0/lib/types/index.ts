// Re-export all types
export * from './auth'
export * from './content'
export * from './core'

// Common utility types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface FilterParams {
  search?: string
  status?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  author?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface BulkActionParams {
  ids: string[]
  action: 'delete' | 'publish' | 'unpublish' | 'archive' | 'restore'
}

// Table column definition
export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  width?: string
  align?: 'start' | 'center' | 'end'
  render?: (value: unknown, row: T) => React.ReactNode
}
