from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import AccessProfile, Role, User


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "is_system", "created_at")
    search_fields = ("name", "code")
    list_filter = ("is_system",)
    filter_horizontal = ("permissions",)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "is_staff", "is_active")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email", "first_name", "last_name", "phone")
    fieldsets = BaseUserAdmin.fieldsets + (
        ("دسترسی سفارشی", {"fields": ("phone", "roles", "access_profile")}),
    )
    filter_horizontal = ("groups", "user_permissions", "roles")


@admin.register(AccessProfile)
class AccessProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "can_publish", "can_delete", "can_manage_users", "created_at")
    search_fields = ("name", "role__name", "role__code")
