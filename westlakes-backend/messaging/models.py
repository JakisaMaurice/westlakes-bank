from django.db import models
from django.conf import settings
from django.utils import timezone


class Message(models.Model):
    MESSAGE_TYPE_CHOICES = [
        ('DIRECT', 'Direct Message'),
        ('ANNOUNCEMENT', 'Announcement'),
        ('WARNING', 'Warning'),
        ('INFO', 'Information'),
    ]

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_messages'
    )
    message_type = models.CharField(max_length=15, choices=MESSAGE_TYPE_CHOICES, default='DIRECT')
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"From {self.sender.full_name} to {self.recipient.full_name}: {self.subject or '(no subject)'}"

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()

    class Meta:
        ordering = ['-created_at']
