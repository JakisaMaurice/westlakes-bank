from django.db import models
from django.utils import timezone
from django.conf import settings
import random
import string


def generate_card_number():
    while True:
        number = ''.join([str(random.randint(0, 9)) for _ in range(16)])
        if not BankAccount.objects.filter(card_number=number).exists():
            return number


def generate_cvv():
    return ''.join([str(random.randint(0, 9)) for _ in range(3)])


class BankAccount(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ('SAVINGS', 'Savings'),
        ('CURRENT', 'Current'),
        ('BUSINESS', 'Business'),
    ]

    CURRENCY_CHOICES = [
        ('GBP', 'British Pound'),
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
    ]

    STATUS_CHOICES = [
        ('PENDING_VERIFICATION', 'Pending Verification'),
        ('ACTIVE', 'Active'),
        ('SUSPENDED', 'Suspended'),
        ('FROZEN', 'Frozen'),
        ('LOCKED', 'Locked'),
        ('REJECTED', 'Rejected'),
    ]

    CARD_STATUS_CHOICES = [
        ('NOT_ISSUED', 'Not Issued'),
        ('PENDING', 'Pending Approval'),
        ('ISSUED', 'Issued'),
        ('ACTIVE', 'Active'),
        ('BLOCKED', 'Blocked'),
        ('EXPIRED', 'Expired'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='accounts')
    account_number = models.CharField(max_length=20, unique=True, blank=True)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE_CHOICES, default='SAVINGS')
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='GBP')
    nickname = models.CharField(max_length=50, blank=True, default='')
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_VERIFICATION')
    reason = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now)

    card_number = models.CharField(max_length=16, unique=True, blank=True, null=True)
    card_cvv = models.CharField(max_length=3, blank=True, null=True)
    card_status = models.CharField(max_length=15, choices=CARD_STATUS_CHOICES, default='NOT_ISSUED')
    card_pin = models.CharField(max_length=128, blank=True, null=True)
    card_expiry = models.DateField(blank=True, null=True)
    card_daily_limit = models.DecimalField(max_digits=12, decimal_places=2, default=1000.00)
    card_issued_at = models.DateTimeField(blank=True, null=True)
    card_blocked_reason = models.TextField(blank=True, default='')

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

    def set_card_pin(self, raw_pin):
        from django.contrib.auth.hashers import make_password
        self.card_pin = make_password(raw_pin)

    def check_card_pin(self, raw_pin):
        from django.contrib.auth.hashers import check_password
        if not self.card_pin:
            return False
        return check_password(raw_pin, self.card_pin)

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

    @property
    def has_active_card(self):
        return self.card_status == 'ACTIVE' and self.card_number is not None

    @property
    def card_last_four(self):
        if self.card_number and len(self.card_number) >= 4:
            return self.card_number[-4:]
        return None

    @property
    def card_status_display(self):
        return dict(self.CARD_STATUS_CHOICES).get(self.card_status, self.card_status)
