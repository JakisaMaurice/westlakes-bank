from django.db import models
from django.utils import timezone
from django.conf import settings
from accounts.models import BankAccount
import uuid


class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('DEPOSIT', 'Deposit'),
        ('WITHDRAWAL', 'Withdrawal'),
        ('TRANSFER', 'Transfer'),
        ('REVERSAL', 'Reversal'),
        ('CHARGE', 'Charge'),
    ]

    DEPOSIT_TYPE_CHOICES = [
        ('CASH', 'Cash Deposit'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('ACCOUNT_TRANSFER', 'Account Transfer'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('ONLINE_PLATFORM', 'Online Platform'),
        ('ADJUSTMENT', 'Adjustment'),
        ('INTEREST', 'Interest Credit'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESSFUL', 'Successful'),
        ('FAILED', 'Failed'),
        ('REVERSED', 'Reversed'),
    ]

    sender_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='sent_transactions', null=True, blank=True)
    receiver_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='received_transactions', null=True, blank=True)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    deposit_type = models.CharField(max_length=20, choices=DEPOSIT_TYPE_CHOICES, blank=True, null=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    transaction_reference = models.CharField(max_length=50, unique=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    timestamp = models.DateTimeField(default=timezone.now)
    description = models.TextField(blank=True)
    balance_after = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.transaction_reference:
            while True:
                reference = f"TXN{uuid.uuid4().hex[:8].upper()}"
                if not Transaction.objects.filter(transaction_reference=reference).exists():
                    self.transaction_reference = reference
                    break
        super().save(*args, **kwargs)

    @property
    def is_completed(self):
        return self.status == 'SUCCESSFUL'

    @property
    def is_pending(self):
        return self.status == 'PENDING'

    @property
    def is_reversed(self):
        return self.status == 'REVERSED'

    class Meta:
        ordering = ['-timestamp']


class Transfer(models.Model):
    TRANSFER_TYPE_CHOICES = [
        ('INTERNAL', 'Internal Transfer'),
        ('EXTERNAL', 'External Transfer'),
    ]

    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='transfer_details')
    transfer_type = models.CharField(max_length=10, choices=TRANSFER_TYPE_CHOICES, default='EXTERNAL')
    recipient_name = models.CharField(max_length=255, blank=True)
    external_account_number = models.CharField(max_length=30, blank=True)
    external_bank_name = models.CharField(max_length=255, blank=True)
    confirmation_pin_used = models.BooleanField(default=False)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Transfer {self.transaction.transaction_reference}"


class Deposit(models.Model):
    DEPOSIT_TYPE_CHOICES = [
        ('CASH', 'Cash Deposit'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('ACCOUNT_TRANSFER', 'Account Transfer'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('ONLINE_PLATFORM', 'Online Platform'),
        ('ADJUSTMENT', 'Adjustment'),
        ('INTEREST', 'Interest Credit'),
    ]

    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='deposit_details')
    deposit_type = models.CharField(max_length=20, choices=DEPOSIT_TYPE_CHOICES, default='CASH')
    source_account_number = models.CharField(max_length=20, blank=True, help_text="External account number for transfers")
    source_platform = models.CharField(max_length=100, blank=True, help_text="Platform name for mobile money / online deposits")
    source_reference = models.CharField(max_length=100, blank=True, help_text="Reference ID from the source platform")
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_deposits'
    )
    reference_number = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Deposit {self.transaction.transaction_reference}"
