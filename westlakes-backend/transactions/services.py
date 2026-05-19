from django.db import transaction as db_transaction
from django.core.mail import send_mail
from django.conf import settings
from .models import Transaction
from accounts.models import BankAccount
from notifications.models import Notification


class TransactionService:
    @staticmethod
    def process_transaction(transaction):
        """
        Process a transaction and update account balances.
        """
        with db_transaction.atomic():
            if transaction.transaction_type == 'TRANSFER':
                # Deduct from sender
                transaction.sender_account.balance -= transaction.amount
                transaction.sender_account.save()

                # Add to receiver
                transaction.receiver_account.balance += transaction.amount
                transaction.receiver_account.save()

            elif transaction.transaction_type == 'DEPOSIT':
                # Add to receiver account
                transaction.receiver_account.balance += transaction.amount
                transaction.receiver_account.save()

            elif transaction.transaction_type == 'WITHDRAWAL':
                # Deduct from sender account
                transaction.sender_account.balance -= transaction.amount
                transaction.sender_account.save()

            # Mark transaction as completed
            transaction.status = 'COMPLETED'
            transaction.save()

            # Create notifications
            TransactionService._create_transaction_notifications(transaction)
            
            # Send email notifications
            TransactionService._send_transaction_emails(transaction)

    @staticmethod
    def _send_transaction_emails(transaction):
        """
        Send email notifications for transactions.
        """
        if not getattr(settings, 'EMAIL_HOST', None):
            # Skip email if not configured
            return
            
        if transaction.transaction_type == 'DEPOSIT':
            # Send deposit confirmation email to customer
            try:
                send_mail(
                    subject=f'Deposit Confirmation - {transaction.amount}',
                    message=f'''
Hello {transaction.receiver_account.user.full_name},

Your deposit of £{transaction.amount} has been successfully processed.

Transaction Details:
- Amount: £{transaction.amount}
- Reference: {transaction.transaction_reference}
- Date: {transaction.timestamp.strftime('%Y-%m-%d %H:%M:%S')}
- Status: {transaction.status}

Your new account balance is: £{transaction.receiver_account.balance}

Thank you for banking with Westlakes Bank.

Best regards,
Westlakes Bank Team
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[transaction.receiver_account.user.email],
                    fail_silently=False,
                )
            except Exception:
                # Log error but don't fail the transaction
                pass

    @staticmethod
    def _create_transaction_notifications(transaction):
        """
        Create notifications for transaction participants.
        """
        if transaction.transaction_type == 'TRANSFER':
            # Notify sender
            Notification.objects.create(
                user=transaction.sender_account.user,
                title='Transfer Sent',
                message=f'You sent £{transaction.amount} to account {transaction.receiver_account.account_number}'
            )

            # Notify receiver
            Notification.objects.create(
                user=transaction.receiver_account.user,
                title='Transfer Received',
                message=f'You received £{transaction.amount} from {transaction.sender_account.user.full_name}'
            )

        elif transaction.transaction_type == 'DEPOSIT':
            Notification.objects.create(
                user=transaction.receiver_account.user,
                title='Deposit Successful',
                message=f'£{transaction.amount} has been deposited to your account'
            )

        elif transaction.transaction_type == 'WITHDRAWAL':
            Notification.objects.create(
                user=transaction.sender_account.user,
                title='Withdrawal Successful',
                message=f'£{transaction.amount} has been withdrawn from your account'
            )

    @staticmethod
    def validate_transfer(sender_account, receiver_account, amount):
        """
        Validate transfer requirements.
        """
        if sender_account.status != 'ACTIVE':
            raise ValueError("Sender account is not active")

        if receiver_account.status != 'ACTIVE':
            raise ValueError("Receiver account is not active")

        if sender_account.balance < amount:
            raise ValueError("Insufficient balance")

        if sender_account == receiver_account:
            raise ValueError("Cannot transfer to the same account")

        return True
