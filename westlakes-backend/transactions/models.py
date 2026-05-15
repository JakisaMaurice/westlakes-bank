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
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]

    sender_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='sent_transactions', null=True, blank=True)
    receiver_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='received_transactions', null=True, blank=True)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_reference = models.CharField(max_length=50, unique=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    timestamp = models.DateTimeField(default=timezone.now)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.transaction_reference:
            # Generate a unique transaction reference
            while True:
                reference = f"TXN{uuid.uuid4().hex[:8].upper()}"
                if not Transaction.objects.filter(transaction_reference=reference).exists():
                    self.transaction_reference = reference
                    break
        super().save(*args, **kwargs)

    @property
    def is_completed(self):
        return self.status == 'COMPLETED'

    @property
    def is_pending(self):
        return self.status == 'PENDING'

    class Meta:
        ordering = ['-timestamp']

