from django.contrib import admin

from .models import RedirectRule, SeoRule


@admin.register(SeoRule)
class SeoRuleAdmin(admin.ModelAdmin):
    list_display = ("pattern", "language", "is_active", "priority")
    list_filter = ("is_active", "language")
    search_fields = ("pattern", "title_template")


@admin.register(RedirectRule)
class RedirectRuleAdmin(admin.ModelAdmin):
    list_display = ("from_path", "to_path", "status_code", "is_active", "created_at")
    list_filter = ("status_code", "is_active")
    search_fields = ("from_path", "to_path")
