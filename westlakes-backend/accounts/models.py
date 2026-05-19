from django.db import models
from django.utils import timezone
from django.conf import settings
import random


class BankAccount(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ('SAVINGS', 'Savings'),
        ('CURRENT', 'Current'),
        ('BUSINESS', 'Business'),
    ]

    STATUS_CHOICES = [
        ('PENDING_VERIFICATION', 'Pending Verification'),
        ('ACTIVE', 'Active'),
        ('SUSPENDED', 'Suspended'),
        ('FROZEN', 'Frozen'),
        ('LOCKED', 'Locked'),
        ('REJECTED', 'Rejected'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='accounts')
    account_number = models.CharField(max_length=20, unique=True, blank=True)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE_CHOICES, default='SAVINGS')
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_VERIFICATION')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.full_name} - {self.account_number} ({self.account_type})"

    def save(self, *args, **kwargs):
        if not self.account_number:
            prefix = {'SAVINGS': '100', 'CURRENT': '200', 'BUSINESS': '300'}.get(self.account_type, '100')
            while True:
                suffix = ''.join([str(random.randint(0, 9)) for _ in range(10)])
                account_number = f"{prefix}{suffix}"
                if not BankAccount.objects.filter(account_number=account_number).exists():
                    self.account_number = account_number
                    break
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        return self.status == 'ACTIVE'

    @property
    def is_pending(self):
        return self.status == 'PENDING_VERIFICATION'

    @property
    def is_suspended(self):
        return self.status == 'SUSPENDED'

    @property
    def is_frozen(self):
        return self.status == 'FROZEN'

    @property
    def is_locked(self):
        return self.status == 'LOCKED'

    @property
    def can_transact(self):
        return self.status == 'ACTIVE'
