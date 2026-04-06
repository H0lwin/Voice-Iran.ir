from django.contrib import admin

from .models import ApiClient, ApiKey, ApiRateLimit


class ApiKeyInline(admin.TabularInline):
    model = ApiKey
    extra = 0


class ApiRateLimitInline(admin.TabularInline):
    model = ApiRateLimit
    extra = 0


@admin.register(ApiClient)
class ApiClientAdmin(admin.ModelAdmin):
    list_display = ("name", "client_type", "is_active", "created_at")
    list_filter = ("client_type", "is_active")
    search_fields = ("name",)
    filter_horizontal = ("owners",)
    inlines = (ApiKeyInline, ApiRateLimitInline)


@admin.register(ApiKey)
class ApiKeyAdmin(admin.ModelAdmin):
    list_display = ("client", "key_prefix", "is_active", "expires_at", "last_used_at")
    list_filter = ("is_active",)
    search_fields = ("key_prefix",)


@admin.register(ApiRateLimit)
class ApiRateLimitAdmin(admin.ModelAdmin):
    list_display = ("client", "scope", "limit_per_minute", "limit_per_day", "burst_limit", "is_active")
    list_filter = ("is_active",)
    search_fields = ("scope",)
