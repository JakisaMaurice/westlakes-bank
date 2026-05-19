from django.db import models
from django.conf import settings
from django.utils import timezone


class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('ACCOUNT_APPROVED', 'Account Approved'),
        ('ACCOUNT_REJECTED', 'Account Rejected'),
        ('VERIFICATION_APPROVED', 'Verification Approved'),
        ('VERIFICATION_REJECTED', 'Verification Rejected'),
        ('DEPOSIT', 'Deposit'),
        ('TRANSFER_SENT', 'Transfer Sent'),
        ('TRANSFER_RECEIVED', 'Transfer Received'),
        ('ACCOUNT_SUSPENDED', 'Account Suspended'),
        ('ACCOUNT_FROZEN', 'Account Frozen'),
        ('PASSWORD_RESET', 'Password Reset'),
        ('KYC_REMINDER', 'KYC Reminder'),
        ('GENERAL', 'General'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=25, choices=NOTIFICATION_TYPE_CHOICES, default='GENERAL')
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
