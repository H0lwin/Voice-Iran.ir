from django.contrib import admin

from .models import Weapon, WeaponSpecification


class WeaponSpecificationInline(admin.TabularInline):
    model = WeaponSpecification
    extra = 0


@admin.register(Weapon)
class WeaponAdmin(admin.ModelAdmin):
    list_display = ("slug", "status", "category", "range_km", "is_featured", "published_at")
    list_filter = ("status", "is_featured", "category")
    search_fields = ("slug", "name_fa", "name_en")
    inlines = (WeaponSpecificationInline,)


@admin.register(WeaponSpecification)
class WeaponSpecificationAdmin(admin.ModelAdmin):
    list_display = ("weapon", "key", "value", "unit", "sort_order", "is_public")
    list_filter = ("is_public",)
    search_fields = ("key", "value")
