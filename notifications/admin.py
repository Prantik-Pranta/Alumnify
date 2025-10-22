# notifications/admin.py
from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "notif_type", "user", "is_read", "created_at", "message_short")
    list_filter = ("notif_type", "is_read", "created_at")
    search_fields = ("message", "user__username", "user__first_name", "user__last_name", "url")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)

    def message_short(self, obj):
        return (obj.message[:60] + "…") if obj.message and len(obj.message) > 60 else obj.message
    message_short.short_description = "Message"
