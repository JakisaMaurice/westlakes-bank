from django.db import transaction as db_transaction
from django.utils import timezone
from .models import Transaction, Transfer, Deposit
from accounts.models import BankAccount
from notifications.services import NotificationService
from audit_logs.models import AuditLog


class TransactionService:
    @staticmethod
    def process_transaction(transaction):
        """
        Process a transaction and update account balances.
        """
        with db_transaction.atomic():
            if transaction.transaction_type == 'TRANSFER':
                transaction.sender_account.balance -= transaction.amount + transaction.fee
                transaction.sender_account.save()

                transaction.receiver_account.balance += transaction.amount
                transaction.receiver_account.save()

                transaction.balance_after = transaction.sender_account.balance

            elif transaction.transaction_type == 'DEPOSIT':
                transaction.receiver_account.balance += transaction.amount
                transaction.receiver_account.save()
                transaction.balance_after = transaction.receiver_account.balance

            elif transaction.transaction_type == 'WITHDRAWAL':
                transaction.sender_account.balance -= transaction.amount
                transaction.sender_account.save()
                transaction.balance_after = transaction.sender_account.balance

            transaction.status = 'SUCCESSFUL'
            transaction.save()

            TransactionService._create_transaction_notifications(transaction)

    @staticmethod
    def _create_transaction_notifications(transaction):
        if transaction.transaction_type == 'TRANSFER':
            NotificationService.notify_transfer_sent(
                user=transaction.sender_account.user,
                amount=transaction.amount,
                to_account=transaction.receiver_account.account_number,
                fee=str(transaction.fee),
                balance_after=str(transaction.balance_after) if transaction.balance_after else "",
                recipient_name=transaction.receiver_account.user.full_name,
                sender_account=transaction.sender_account.account_number,
                reference=transaction.transaction_reference,
            )
            NotificationService.notify_transfer_received(
                user=transaction.receiver_account.user,
                amount=transaction.amount,
                from_name=transaction.sender_account.user.full_name,
                from_account=transaction.sender_account.account_number,
                reference=transaction.transaction_reference,
            )
        elif transaction.transaction_type == 'DEPOSIT':
            deposit_type = "Cash Deposit"
            if transaction.deposit_type:
                deposit_type = dict(Transaction.DEPOSIT_TYPE_CHOICES).get(transaction.deposit_type, transaction.deposit_type)
            NotificationService.notify_deposit(
                user=transaction.receiver_account.user,
                amount=transaction.amount,
                account_number=transaction.receiver_account.account_number,
                balance_after=str(transaction.balance_after) if transaction.balance_after else "",
                deposit_type=deposit_type,
                reference=transaction.transaction_reference,
            )
        elif transaction.transaction_type == 'WITHDRAWAL':
            NotificationService.notify_withdrawal(
                user=transaction.sender_account.user,
                amount=transaction.amount,
                account_number=transaction.sender_account.account_number,
                balance_after=str(transaction.balance_after) if transaction.balance_after else "",
                reference=transaction.transaction_reference,
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

    @staticmethod
    def create_deposit(account, amount, deposit_type='CASH', description='', processed_by=None):
        """
        Create and process a deposit.
        """
        with db_transaction.atomic():
            transaction = Transaction.objects.create(
                receiver_account=account,
                transaction_type='DEPOSIT',
                deposit_type=deposit_type,
                amount=amount,
                description=description,
                status='PENDING'
            )

            Deposit.objects.create(
                transaction=transaction,
                deposit_type=deposit_type,
                processed_by=processed_by
            )

            TransactionService.process_transaction(transaction)

            if processed_by:
                AuditLog.objects.create(
                    admin=processed_by,
                    customer=account.user,
                    action='DEPOSIT_MADE',
                    new_value={
                        'amount': str(amount),
                        'type': deposit_type,
                        'reference': transaction.transaction_reference
                    },
                    notes=description
                )

            return transaction

    @staticmethod
    def create_transfer(sender_account, receiver_account, amount, description='', pin_confirmed=False):
        """
        Create and process a transfer.
        """
        with db_transaction.atomic():
            fee = TransactionService.calculate_fee(amount)

            transaction = Transaction.objects.create(
                sender_account=sender_account,
                receiver_account=receiver_account,
                transaction_type='TRANSFER',
                amount=amount,
                fee=fee,
                description=description,
                status='PENDING'
            )

            Transfer.objects.create(
                transaction=transaction,
                transfer_type='EXTERNAL' if sender_account.user != receiver_account.user else 'INTERNAL',
                recipient_name=receiver_account.user.full_name,
                confirmation_pin_used=pin_confirmed,
                confirmed_at=timezone.now() if pin_confirmed else None
            )

            TransactionService.process_transaction(transaction)

            AuditLog.objects.create(
                customer=sender_account.user,
                action='TRANSFER_MADE',
                new_value={
                    'amount': str(amount),
                    'fee': str(fee),
                    'to_account': receiver_account.account_number,
                    'reference': transaction.transaction_reference
                }
            )

            return transaction

    @staticmethod
    def calculate_fee(amount):
        """
        Calculate transfer fee based on amount.
        """
        if amount <= 100:
            return 0.50
        elif amount <= 1000:
            return 1.00
        elif amount <= 10000:
            return 2.50
        else:
            return 5.00

    @staticmethod
    def reverse_transaction(transaction, reason='', admin=None):
        """
        Reverse a completed transaction.
        """
        if transaction.status != 'SUCCESSFUL':
            raise ValueError("Only successful transactions can be reversed")

        with db_transaction.atomic():
            if transaction.transaction_type == 'TRANSFER':
                transaction.sender_account.balance += transaction.amount + transaction.fee
                transaction.sender_account.save()

                transaction.receiver_account.balance -= transaction.amount
                transaction.receiver_account.save()

            elif transaction.transaction_type == 'DEPOSIT':
                transaction.receiver_account.balance -= transaction.amount
                transaction.receiver_account.save()

            elif transaction.transaction_type == 'WITHDRAWAL':
                transaction.sender_account.balance += transaction.amount
                transaction.sender_account.save()

            transaction.status = 'REVERSED'
            transaction.save()

            NotificationService.create_notification(
                user=transaction.sender_account.user if transaction.sender_account else transaction.receiver_account.user,
                notification_type='TRANSFER_SENT',
                title='Transaction Reversed',
                message=f'Transaction {transaction.transaction_reference} has been reversed. Reason: {reason}',
            )

            if admin:
                AuditLog.objects.create(
                    admin=admin,
                    action='TRANSFER_REVERSED',
                    previous_value={'status': 'SUCCESSFUL'},
                    new_value={'status': 'REVERSED'},
                    notes=reason
                )

            return transaction
