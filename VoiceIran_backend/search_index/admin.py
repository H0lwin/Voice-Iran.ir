from django.contrib import admin

from .models import PopularSearchTerm


@admin.register(PopularSearchTerm)
class PopularSearchTermAdmin(admin.ModelAdmin):
    list_display = ("slug", "label_fa", "term_type", "weight", "is_active", "updated_at")
    list_filter = ("term_type", "is_active")
    search_fields = ("slug", "label_fa", "label_en")
