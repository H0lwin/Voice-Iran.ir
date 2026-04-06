from django.contrib import admin

from .models import Document, DocumentCollection, DocumentFile, DocumentTimelineEvent, DocumentType


class DocumentFileInline(admin.TabularInline):
    model = DocumentFile
    extra = 0


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("slug", "status", "document_type", "is_featured", "published_at", "updated_at")
    list_filter = ("status", "is_featured", "document_type")
    search_fields = ("slug", "title_fa", "title_en")
    filter_horizontal = ("collections",)
    inlines = (DocumentFileInline,)


@admin.register(DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "is_active")
    list_filter = ("is_active",)
    search_fields = ("code", "name", "name_en")


@admin.register(DocumentCollection)
class DocumentCollectionAdmin(admin.ModelAdmin):
    list_display = ("slug", "title", "is_public", "created_at")
    list_filter = ("is_public",)
    search_fields = ("slug", "title", "title_en")


@admin.register(DocumentFile)
class DocumentFileAdmin(admin.ModelAdmin):
    list_display = ("document", "file", "file_role", "language", "is_primary", "sort_order")
    list_filter = ("file_role", "is_primary")


@admin.register(DocumentTimelineEvent)
class DocumentTimelineEventAdmin(admin.ModelAdmin):
    list_display = ("year", "title_fa", "sort_order", "is_active", "updated_at")
    list_filter = ("is_active", "year")
    search_fields = ("title_fa", "title_en", "description_fa", "description_en")
