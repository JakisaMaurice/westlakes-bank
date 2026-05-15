from django.db import models
from django.utils import timezone
from django.conf import settings


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    read_status = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Notification for {self.user.full_name}: {self.title}"

    @property
    def is_read(self):
        return self.read_status

    def mark_as_read(self):
        self.read_status = True
        self.save()

    class Meta:
        ordering = ['-created_at']
