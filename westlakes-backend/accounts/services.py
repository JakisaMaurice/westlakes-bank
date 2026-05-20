from .models import BankAccount
from notifications.services import NotificationService
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

            NotificationService.notify_account_approved(account)

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

            NotificationService.notify_account_rejected(account, reason=reason)

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

            NotificationService.notify_account_suspended(account, reason=reason)

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

            NotificationService.notify_account_reactivated(account)

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

            NotificationService.notify_account_frozen(account, reason=reason)

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

            NotificationService.notify_account_locked(account, reason=reason)

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

            NotificationService.notify_account_unlocked(account)

            if admin:
                AccountService._log_action(
                    admin=admin,
                    action='ACCOUNT_UNLOCKED',
                    customer=account.user,
                    previous_value=previous,
                    new_value=new,
                )
