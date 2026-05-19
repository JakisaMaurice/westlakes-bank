from django.db import models
from django.conf import settings
from django.utils import timezone


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CUSTOMER_APPROVED', 'Customer Approved'),
        ('CUSTOMER_REJECTED', 'Customer Rejected'),
        ('CUSTOMER_VERIFIED', 'Customer Verified'),
        ('ACCOUNT_CREATED', 'Account Created'),
        ('ACCOUNT_APPROVED', 'Account Approved'),
        ('ACCOUNT_REJECTED', 'Account Rejected'),
        ('ACCOUNT_FROZEN', 'Account Frozen'),
        ('ACCOUNT_SUSPENDED', 'Account Suspended'),
        ('ACCOUNT_REACTIVATED', 'Account Reactivated'),
        ('ACCOUNT_LOCKED', 'Account Locked'),
        ('ACCOUNT_UNLOCKED', 'Account Unlocked'),
        ('PASSWORD_RESET', 'Password Reset'),
        ('DEPOSIT_MADE', 'Deposit Made'),
        ('WITHDRAWAL_MADE', 'Withdrawal Made'),
        ('TRANSFER_MADE', 'Transfer Made'),
        ('TRANSFER_REVERSED', 'Transfer Reversed'),
        ('MESSAGE_SENT', 'Message Sent'),
        ('PROFILE_UPDATED', 'Profile Updated'),
        ('DOCUMENT_UPLOADED', 'Document Uploaded'),
        ('KYC_SUBMITTED', 'KYC Submitted'),
        ('KYC_APPROVED', 'KYC Approved'),
        ('KYC_REJECTED', 'KYC Rejected'),
        ('SETTINGS_CHANGED', 'Settings Changed'),
        ('TRANSACTION_PIN_SET', 'Transaction PIN Set'),
    ]

    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs_as_customer'
    )
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    previous_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    notes = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        admin_name = self.admin.full_name if self.admin else "System"
        return f"{admin_name} - {self.get_action_display()} at {self.timestamp}"

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
