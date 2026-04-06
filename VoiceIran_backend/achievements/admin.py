from django.contrib import admin

from .models import Achievement


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = (
        "slug",
        "status",
        "target_type",
        "verification_status",
        "destroyed_targets_count",
        "is_featured",
        "published_at",
    )
    list_filter = ("status", "target_type", "verification_status", "is_featured")
    search_fields = ("slug", "title_fa", "title_en", "region_fa", "region_en")
