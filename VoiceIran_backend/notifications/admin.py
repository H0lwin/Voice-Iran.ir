from django.contrib import admin

from .models import Notification, NotificationTemplate


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "channel", "priority", "status", "scheduled_at", "sent_at", "created_by")
    list_filter = ("channel", "priority", "status")
    search_fields = ("title", "body")


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ("code", "channel", "is_active", "updated_at")
    list_filter = ("channel", "is_active")
    search_fields = ("code", "title_template", "body_template")
