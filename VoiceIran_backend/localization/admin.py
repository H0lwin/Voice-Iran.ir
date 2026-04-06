from django.contrib import admin

from .models import Language


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "direction", "calendar_system", "is_default", "is_active")
    list_filter = ("direction", "is_default", "is_active")
    search_fields = ("name", "code")
