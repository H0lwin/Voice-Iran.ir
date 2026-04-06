// Authentication and Authorization Types

export type UserRole = 'superadmin' | 'content_manager' | 'editor' | 'viewer'

export interface Permission {
  id: string
  codename: string
  name: string // Persian name
  description?: string
}

export interface Role {
  id: string
  name: string // Persian name
  codename: UserRole
  permissions: Permission[]
  userCount: number
  createdAt: string
  updatedAt: string
}

export interface AccessProfile {
  id: string
  name: string // Persian name
  description?: string
  roleId?: string
  canPublish?: boolean
  canDelete?: boolean
  canManageUsers?: boolean
  canViewAudit?: boolean
  allowedApps: string[]
  deniedApps: string[]
  customPermissions: Record<string, string[]>
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  username: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  fullName: string // firstName + lastName
  avatar?: string
  role: Role
  roles?: Role[]
  accessProfile?: AccessProfile
  isActive: boolean
  isStaff: boolean
  isSuperuser: boolean
  lastLogin?: string
  dateJoined: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  user: User
  token: string
  expiresAt: string
}

// App permission definitions
export type AppName = 
  | 'news'
  | 'arsenal'
  | 'martyrs'
  | 'documents'
  | 'achievements'
  | 'accounts'
  | 'core'
  | 'taxonomy'
  | 'seo'
  | 'publishing'
  | 'notifications'
  | 'api'
  | 'analytics'

export type PermissionAction = 'view' | 'add' | 'change' | 'delete' | 'publish'

export const APP_PERMISSIONS: Record<AppName, UserRole[]> = {
  news: ['superadmin', 'content_manager', 'editor', 'viewer'],
  arsenal: ['superadmin', 'content_manager', 'editor', 'viewer'],
  martyrs: ['superadmin', 'content_manager', 'editor', 'viewer'],
  documents: ['superadmin', 'content_manager', 'editor', 'viewer'],
  achievements: ['superadmin', 'content_manager', 'editor', 'viewer'],
  accounts: ['superadmin'],
  core: ['superadmin'],
  taxonomy: ['superadmin', 'content_manager'],
  seo: ['superadmin', 'content_manager'],
  publishing: ['superadmin', 'content_manager'],
  notifications: ['superadmin', 'content_manager'],
  api: ['superadmin'],
  analytics: ['superadmin', 'content_manager', 'editor'],
}

// Role-based action permissions
export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superadmin: ['view', 'add', 'change', 'delete', 'publish'],
  content_manager: ['view', 'add', 'change', 'delete', 'publish'],
  editor: ['view', 'add', 'change'],
  viewer: ['view'],
}

// Persian labels for roles
export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'مدیر ارشد',
  content_manager: 'مدیر محتوا',
  editor: 'ویراستار',
  viewer: 'بازدیدکننده',
}

// Persian labels for apps
export const APP_LABELS: Record<AppName, string> = {
  news: 'اخبار',
  arsenal: 'تسلیحات',
  martyrs: 'شهدا',
  documents: 'اسناد',
  achievements: 'دستاوردها',
  accounts: 'کاربران',
  core: 'هسته',
  taxonomy: 'طبقه‌بندی',
  seo: 'سئو',
  publishing: 'انتشار',
  notifications: 'اعلان‌ها',
  api: 'API',
  analytics: 'تحلیل',
}
