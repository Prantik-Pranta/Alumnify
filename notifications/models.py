# notifications/models.py
from django.db import models
from django.contrib.auth.models import User

class Notification(models.Model):
    NOTIF_TYPES = [
        ("connection", "Connection"),
        ("message", "Message"),
        ("post", "Post"),
        ("comment", "Comment"),
        ("like", "Like"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    notif_type = models.CharField(max_length=20, choices=NOTIF_TYPES, default="other")
    message = models.TextField()
    url = models.CharField(max_length=500, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} · {self.notif_type} · {'read' if self.is_read else 'unread'}"
