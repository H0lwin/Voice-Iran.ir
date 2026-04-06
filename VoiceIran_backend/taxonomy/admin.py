from django.contrib import admin

from .models import Term


@admin.register(Term)
class TermAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "type", "domain", "parent", "is_active", "sort_order")
    list_filter = ("type", "domain", "is_active")
    search_fields = ("name", "name_en", "slug")
