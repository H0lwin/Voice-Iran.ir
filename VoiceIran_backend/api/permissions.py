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
