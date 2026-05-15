from django.db import transaction as db_transaction
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
