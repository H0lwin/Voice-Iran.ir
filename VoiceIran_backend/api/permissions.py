from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsEditorOrReadOnly(BasePermission):
    """Read for all, write only for staff/editor roles."""

    editor_role_codes = {"editor", "admin", "super-admin", "content-manager"}

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser or user.is_staff:
            return True
        return user.roles.filter(code__in=self.editor_role_codes).exists()


class IsAdminOrReadOnly(BasePermission):
    """Only admins can write, everyone can read."""
    
    admin_role_codes = {"admin", "super-admin", "superadmin"}
    
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        return user.roles.filter(code__in=self.admin_role_codes).exists()


class IsContentManagerOrReadOnly(BasePermission):
    """Content managers and admins can write."""
    
    writer_role_codes = {"admin", "super-admin", "superadmin", "content-manager", "editor"}
    
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        return user.roles.filter(code__in=self.writer_role_codes).exists()


class AdminDashboardPermission(BasePermission):
    """
    Role-based permission for Admin Dashboard.
    
    Roles:
    - superadmin: Full access to everything
    - content_manager: Can manage all content, cannot manage users
    - editor: Can only view and edit news content
    - viewer: Read-only access
    """
    
    SUPERADMIN_CODES = {"superadmin", "admin", "super-admin"}
    CONTENT_MANAGER_CODES = {"content_manager", "content-manager", "contentmanager"}
    EDITOR_CODES = {"editor"}
    VIEWER_CODES = {"viewer"}
    
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        
        # Superadmin has full access
        if user.is_superuser:
            return True
        
        # Get user role codes
        role_codes = set(user.roles.values_list("code", flat=True))
        
        # Check view permission (all authenticated users can view)
        if request.method in SAFE_METHODS:
            return True
        
        # For write operations, check role
        action = getattr(view, "action", None)
        
        # Superadmin and content manager can do everything
        if role_codes & self.SUPERADMIN_CODES:
            return True
        
        if role_codes & self.CONTENT_MANAGER_CODES:
            return True
        
        # Editors can only add/change content, not delete
        if role_codes & self.EDITOR_CODES:
            if action in ["list", "retrieve", "create", "update", "partial_update"]:
                return True
            return False
        
        # Viewers can only read
        if role_codes & self.VIEWER_CODES:
            return request.method in SAFE_METHODS
        
        return False
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanPublishPermission(BasePermission):
    """Check if user can publish content based on AccessProfile."""
    
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        
        # Superadmin can always publish
        if user.is_superuser:
            return True
        
        # Check via AccessProfile
        if user.access_profile and user.access_profile.can_publish:
            return True
        
        # Check via role
        role_codes = set(user.roles.values_list("code", flat=True))
        return bool(role_codes & AdminDashboardPermission.SUPERADMIN_CODES | 
                    role_codes & AdminDashboardPermission.CONTENT_MANAGER_CODES)
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanDeletePermission(BasePermission):
    """Check if user can delete content based on AccessProfile."""
    
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        
        # Superadmin can always delete
        if user.is_superuser:
            return True
        
        # Check via AccessProfile
        if user.access_profile and user.access_profile.can_delete:
            return True
        
        # Check via role
        role_codes = set(user.roles.values_list("code", flat=True))
        return bool(role_codes & AdminDashboardPermission.SUPERADMIN_CODES)
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanManageUsersPermission(BasePermission):
    """Check if user can manage other users."""
    
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        
        # Superadmin can always manage users
        if user.is_superuser:
            return True
        
        # Check via AccessProfile
        if user.access_profile and user.access_profile.can_manage_users:
            return True
        
        return False
