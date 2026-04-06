from django.contrib import admin

from .models import NewsTrendingTerm, Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("slug", "status", "is_featured", "is_live", "published_at", "author", "updated_at")
    list_filter = ("status", "is_featured", "is_live")
    search_fields = ("slug", "title_fa", "title_en", "excerpt_fa", "excerpt_en")
    filter_horizontal = ("categories", "tags")


@admin.register(NewsTrendingTerm)
class NewsTrendingTermAdmin(admin.ModelAdmin):
    list_display = ("slug", "label_fa", "weight", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("slug", "label_fa", "label_en")
