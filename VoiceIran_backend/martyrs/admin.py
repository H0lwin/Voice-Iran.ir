from django.contrib import admin

from .models import Martyr, MartyrAchievement, MartyrUnit


class MartyrAchievementInline(admin.TabularInline):
    model = MartyrAchievement
    extra = 0


@admin.register(Martyr)
class MartyrAdmin(admin.ModelAdmin):
    list_display = ("slug", "status", "unit", "is_featured", "martyrdom_date", "published_at")
    list_filter = ("status", "is_featured", "unit")
    search_fields = ("slug", "name_fa", "name_en")
    inlines = (MartyrAchievementInline,)


@admin.register(MartyrUnit)
class MartyrUnitAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "name_en", "slug")


@admin.register(MartyrAchievement)
class MartyrAchievementAdmin(admin.ModelAdmin):
    list_display = ("martyr", "title", "sort_order")
    search_fields = ("title",)
