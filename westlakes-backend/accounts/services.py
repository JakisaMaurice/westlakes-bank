from .models import BankAccount
from notifications.models import Notification
from audit_logs.models import AuditLog


class AccountService:
    @staticmethod
    def _log_action(admin, action, customer=None, previous_value=None, new_value=None, notes=""):
        AuditLog.objects.create(
            admin=admin,
            customer=customer,
            action=action,
            previous_value=previous_value,
            new_value=new_value,
            notes=notes,
        )

    @staticmethod
    def approve_account(account, admin=None):
        if account.status == 'PENDING_VERIFICATION':
            previous = {'status': account.status}
            account.status = 'ACTIVE'
            account.save()
            new = {'status': account.status}

            Notification.objects.create(
                user=account.user,
                notification_type='ACCOUNT_APPROVED',
                title='Account Approved',
                message=f'Your {account.account_type} account ({account.account_number}) has been approved and is now active.'
            )

            if admin:
                AccountService._log_action(
                    admin=admin,
                    action='ACCOUNT_APPROVED',
                    customer=account.user,
                    previous_value=previous,
                    new_value=new,
                )

    @staticmethod
    def reject_account(account, reason="", admin=None):
        if account.status == 'PENDING_VERIFICATION':
            previous = {'status': account.status}
            account.status = 'REJECTED'
            account.save()
            new = {'status': account.status}

            message = f'Your {account.account_type} account application has been rejected.'
            if reason:
                message += f' Reason: {reason}'

            Notification.objects.create(
                user=account.user,
                notification_type='ACCOUNT_REJECTED',
                title='Account Rejected',
                message=message
            )

            if admin:
                AccountService._log_action(
                    admin=admin,
                    action='ACCOUNT_REJECTED',
                    customer=account.user,
                    previous_value=previous,
                    new_value=new,
                    notes=reason,
                )

    @staticmethod
    def suspend_account(account, reason="", admin=None):
        if account.status == 'ACTIVE':
            previous = {'status': account.status}
            account.status = 'SUSPENDED'
            account.save()
            new = {'status': account.status}

            message = f'Your account ({account.account_number}) has been suspended.'
            if reason:
                message += f' Reason: {reason}'

            Notification.objects.create(
                user=account.user,
                notification_type='ACCOUNT_SUSPENDED',
                title='Account Suspended',
                message=message
            )

            if admin:
                AccountService._log_action(
                    admin=admin,
                    action='ACCOUNT_SUSPENDED',
                    customer=account.user,
                    previous_value=previous,
                    new_value=new,
                    notes=reason,
                )

    @staticmethod
    def activate_account(account, admin=None):
        if account.status in ['SUSPENDED', 'FROZEN', 'LOCKED']:
            previous = {'status': account.status}
            account.status = 'ACTIVE'
            account.save()
            new = {'status': account.status}

            Notification.objects.create(
                user=account.user,
                notification_type='ACCOUNT_APPROVED',
                title='Account Reactivated',
                message=f'Your account ({account.account_number}) has been reactivated.'
            )

            if admin:
                AccountService._log_action(
                    admin=admin,
                    action='ACCOUNT_REACTIVATED',
                    customer=account.user,
                    previous_value=previous,
                    new_value=new,
                )

    @staticmethod
    def freeze_account(account, reason="", admin=None):
        if account.status == 'ACTIVE':
            previous = {'status': account.status}
            account.status = 'FROZEN'
            account.save()
            new = {'status': account.status}

            message = f'Your account ({account.account_number}) has been frozen.'
            if reason:
                message += f' Reason: {reason}'

            Notification.objects.create(
                user=account.user,
                notification_type='ACCOUNT_FROZEN',
                title='Account Frozen',
                message=message
            )

            if admin:
                AccountService._log_action(
                    admin=admin,
                    action='ACCOUNT_FROZEN',
                    customer=account.user,
                    previous_value=previous,
                    new_value=new,
                    notes=reason,
                )

    @staticmethod
    def lock_account(account, reason="", admin=None):
        if account.status in ['ACTIVE', 'FROZEN']:
            previous = {'status': account.status}
            account.status = 'LOCKED'
            account.save()
            new = {'status': account.status}

            message = f'Your account ({account.account_number}) has been locked.'
            if reason:
                message += f' Reason: {reason}'

            Notification.objects.create(
                user=account.user,
                notification_type='ACCOUNT_FROZEN',
                title='Account Locked',
                message=message
            )

            if admin:
                AccountService._log_action(
                    admin=admin,
                    action='ACCOUNT_LOCKED',
                    customer=account.user,
                    previous_value=previous,
                    new_value=new,
                    notes=reason,
                )

    @staticmethod
    def unlock_account(account, admin=None):
        if account.status == 'LOCKED':
            previous = {'status': account.status}
            account.status = 'ACTIVE'
            account.save()
            new = {'status': account.status}

            Notification.objects.create(
                user=account.user,
                notification_type='ACCOUNT_APPROVED',
                title='Account Unlocked',
                message=f'Your account ({account.account_number}) has been unlocked.'
            )

            if admin:
                AccountService._log_action(
                    admin=admin,
                    action='ACCOUNT_UNLOCKED',
                    customer=account.user,
                    previous_value=previous,
                    new_value=new,
                )
