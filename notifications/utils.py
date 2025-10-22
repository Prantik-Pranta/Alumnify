from django.urls import reverse
from .models import Notification

def notify(recipient, notif_type, message, url=''):
    if not recipient:
        return
    Notification.objects.create(
        user=recipient,
        notif_type=notif_type,
        message=message,
        url=url or ''
    )

