from django.db import models
from django.contrib.auth.models import User

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.sender} → {self.receiver}: {self.content[:30]}"

from django.db import models
from django.contrib.auth.models import User

class AlumniAvailability(models.Model):
    alumni = models.ForeignKey(User, on_delete=models.CASCADE, related_name="availability_slots")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_booked = models.BooleanField(default=False)
    booked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="booked_slots")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["start_time"]

    def __str__(self):
        return f"{self.alumni.username} | {self.start_time} → {self.end_time} | {'BOOKED' if self.is_booked else 'FREE'}"
