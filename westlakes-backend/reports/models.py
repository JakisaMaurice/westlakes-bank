from django.db import models
from django.utils import timezone
from django.conf import settings


class Report(models.Model):
    REPORT_TYPE_CHOICES = [
        ('TRANSACTION_SUMMARY', 'Transaction Summary'),
        ('ACCOUNT_ACTIVITY', 'Account Activity'),
        ('CUSTOMER_ANALYTICS', 'Customer Analytics'),
        ('COMPLIANCE_REPORT', 'Compliance Report'),
    ]

    STATUS_CHOICES = [
        ('GENERATING', 'Generating'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    parameters = models.JSONField(default=dict)  # Store report parameters
    file_path = models.FileField(upload_to='reports/', blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='GENERATING')
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.report_type} - {self.title} ({self.status})"

    class Meta:
        ordering = ['-created_at']
