from .models import BankAccount
from notifications.models import Notification


class AccountService:
    @staticmethod
    def approve_account(account):
        """
        Approve a pending account and notify the user.
        """
        if account.status == 'PENDING':
            account.status = 'ACTIVE'
            account.save()

            # Create notification
            Notification.objects.create(
                user=account.user,
                title='Account Approved',
                message=f'Your {account.account_type} account ({account.account_number}) has been approved and is now active.'
            )

    @staticmethod
    def reject_account(account, reason=""):
        """
        Reject a pending account and notify the user.
        """
        if account.status == 'PENDING':
            account.status = 'REJECTED'
            account.save()

            message = f'Your {account.account_type} account application has been rejected.'
            if reason:
                message += f' Reason: {reason}'

            # Create notification
            Notification.objects.create(
                user=account.user,
                title='Account Rejected',
                message=message
            )

    @staticmethod
    def suspend_account(account, reason=""):
        """
        Suspend an active account and notify the user.
        """
        if account.status == 'ACTIVE':
            account.status = 'SUSPENDED'
            account.save()

            message = f'Your account ({account.account_number}) has been suspended.'
            if reason:
                message += f' Reason: {reason}'

            # Create notification
            Notification.objects.create(
                user=account.user,
                title='Account Suspended',
                message=message
            )

    @staticmethod
    def activate_account(account):
        """
        Reactivate a suspended account.
        """
        if account.status == 'SUSPENDED':
            account.status = 'ACTIVE'
            account.save()

            # Create notification
            Notification.objects.create(
                user=account.user,
                title='Account Reactivated',
                message=f'Your account ({account.account_number}) has been reactivated.'
            )
