// Permission hook for RBAC
import { useAuthStore } from '@/lib/store/auth-store'
import { APP_PERMISSIONS, ROLE_PERMISSIONS, type AppName, type PermissionAction, type UserRole } from '@/lib/types'

interface UsePermissionResult {
  hasPermission: boolean
  canView: boolean
  canAdd: boolean
  canChange: boolean
  canDelete: boolean
  canPublish: boolean
  role: UserRole | null
}

// Check if a user role has access to an app
export function hasAppAccess(role: UserRole | null, app: AppName): boolean {
  if (!role) return false
  const allowedRoles = APP_PERMISSIONS[app]
  return allowedRoles?.includes(role) ?? false
}

// Check if a user role can perform an action
export function hasActionPermission(role: UserRole | null, action: PermissionAction): boolean {
  if (!role) return false
  const allowedActions = ROLE_PERMISSIONS[role]
  return allowedActions?.includes(action) ?? false
}

// Main permission hook
export function usePermission(app: AppName, action?: PermissionAction): UsePermissionResult {
  const { user, isAuthenticated } = useAuthStore()
  
  const role = user?.role?.codename as UserRole | null
  
  // Not authenticated
  if (!isAuthenticated || !role) {
    return {
      hasPermission: false,
      canView: false,
      canAdd: false,
      canChange: false,
      canDelete: false,
      canPublish: false,
      role: null,
    }
  }
  
  // Check app access
  const hasAccess = hasAppAccess(role, app)
  
  // If no access to app, deny all
  if (!hasAccess) {
    return {
      hasPermission: false,
      canView: false,
      canAdd: false,
      canChange: false,
      canDelete: false,
      canPublish: false,
      role,
    }
  }
  
  // Check specific action if provided
  const hasSpecificPermission = action 
    ? hasActionPermission(role, action) 
    : true
  
  return {
    hasPermission: hasSpecificPermission,
    canView: hasActionPermission(role, 'view'),
    canAdd: hasActionPermission(role, 'add'),
    canChange: hasActionPermission(role, 'change'),
    canDelete: hasActionPermission(role, 'delete'),
    canPublish: hasActionPermission(role, 'publish'),
    role,
  }
}

// Hook to check multiple apps at once
export function useAppPermissions(): Record<AppName, boolean> {
  const { user, isAuthenticated } = useAuthStore()
  const role = user?.role?.codename as UserRole | null
  
  const apps: AppName[] = [
    'news', 'arsenal', 'martyrs', 'documents', 'achievements',
    'accounts', 'core', 'taxonomy', 'seo', 'publishing',
    'notifications', 'api', 'analytics'
  ]
  
  return apps.reduce((acc, app) => {
    acc[app] = isAuthenticated && hasAppAccess(role, app)
    return acc
  }, {} as Record<AppName, boolean>)
}

// Hook to check if user is superadmin
export function useIsSuperAdmin(): boolean {
  const { user, isAuthenticated } = useAuthStore()
  return isAuthenticated && user?.role?.codename === 'superadmin'
}

// Hook to check if user can manage content (approve/reject)
export function useCanManageContent(): boolean {
  const { user, isAuthenticated } = useAuthStore()
  const role = user?.role?.codename as UserRole | null
  return isAuthenticated && (role === 'superadmin' || role === 'content_manager')
}
