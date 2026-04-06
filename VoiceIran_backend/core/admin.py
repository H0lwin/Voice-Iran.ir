from django.contrib import admin

from .models import AnnouncementBanner, HomePageContent, LiveStat, OrganizationProfile, SiteSetting, StaticPage


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ("site_name", "default_language", "timezone", "is_maintenance_mode", "updated_at")
    list_filter = ("default_language", "is_maintenance_mode")
    search_fields = ("site_name", "site_name_en")


@admin.register(OrganizationProfile)
class OrganizationProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "website", "updated_at")
    search_fields = ("name", "name_en", "email", "phone")


@admin.register(HomePageContent)
class HomePageContentAdmin(admin.ModelAdmin):
    list_display = ("hero_title_fa", "hero_title_en", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("hero_title_fa", "hero_title_en", "latest_news_title_fa", "latest_news_title_en")


@admin.register(LiveStat)
class LiveStatAdmin(admin.ModelAdmin):
    list_display = ("key", "label_fa", "value", "icon_key", "sort_order", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("key", "label_fa", "label_en", "icon_key")


@admin.register(StaticPage)
class StaticPageAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "page_type", "is_published", "published_at", "updated_at")
    list_filter = ("page_type", "is_published")
    search_fields = ("title", "title_en", "slug")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(AnnouncementBanner)
class AnnouncementBannerAdmin(admin.ModelAdmin):
    list_display = ("title", "level", "is_active", "start_at", "end_at", "created_by")
    list_filter = ("level", "is_active")
    search_fields = ("title", "title_en", "body")
