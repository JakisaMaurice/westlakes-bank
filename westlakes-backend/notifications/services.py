import threading
from django.utils import timezone
from .models import Notification
from .email_service import (
    send_email_async as _send_async,
    send_welcome_email,
    send_account_approved_email,
    send_account_rejected_email,
    send_kyc_submitted_email,
    send_kyc_approved_email,
    send_kyc_rejected_email,
    send_deposit_email,
    send_withdrawal_email,
    send_transfer_sent_email,
    send_transfer_received_email,
    send_ticket_created_email,
    send_ticket_replied_email,
    send_ticket_resolved_email,
    send_password_reset_email,
    send_password_changed_email,
    send_suspicious_login_email,
    send_account_suspended_email,
    send_account_frozen_email,
    send_card_issued_email,
    send_card_blocked_email,
    FRONTEND_URL,
    BANK_NAME,
)


class NotificationService:

    @staticmethod
    def _send_email(to_email, subject, message):
        _send_async(to_email, subject, message)

    @staticmethod
    def _send_email_async(to_email, subject, message):
        thread = threading.Thread(
            target=NotificationService._send_email,
            args=(to_email, subject, message),
            daemon=True,
        )
        thread.start()

    @staticmethod
    def create_notification(user, notification_type, title, message, send_email=True):
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
        )
        if send_email and user.email:
            NotificationService._send_email_async(user.email, title, message)
        return notification

    @staticmethod
    def notify_welcome(user):
        NotificationService.create_notification(
            user=user,
            notification_type="GENERAL",
            title=f"Welcome to {BANK_NAME}",
            message=f"Welcome, {user.full_name}! Please complete your account setup by uploading your KYC documents.",
            send_email=False,
        )
        accounts = user.accounts.all()
        account_number = accounts[0].account_number if accounts else "N/A"
        send_welcome_email(user.email, user.full_name, account_number)

    @staticmethod
    def notify_account_approved(account):
        NotificationService.create_notification(
            user=account.user,
            notification_type="ACCOUNT_APPROVED",
            title="Account Approved",
            message=f"Your {account.account_type} account ({account.account_number}) has been approved and is now active.",
            send_email=False,
        )
        send_account_approved_email(
            account.user.email,
            account.user.full_name,
            account.account_number,
            account.get_account_type_display(),
        )

    @staticmethod
    def notify_account_rejected(account, reason=""):
        msg = f"Your {account.account_type} account application has been rejected."
        if reason:
            msg += f" Reason: {reason}"
        NotificationService.create_notification(
            user=account.user,
            notification_type="ACCOUNT_REJECTED",
            title="Account Rejected",
            message=msg,
            send_email=False,
        )
        send_account_rejected_email(account.user.email, account.user.full_name, reason)

    @staticmethod
    def notify_account_suspended(account, reason=""):
        msg = f"Your account ({account.account_number}) has been suspended."
        if reason:
            msg += f" Reason: {reason}"
        NotificationService.create_notification(
            user=account.user,
            notification_type="ACCOUNT_SUSPENDED",
            title="Account Suspended",
            message=msg,
            send_email=False,
        )
        send_account_suspended_email(account.user.email, account.user.full_name, account.account_number, reason)

    @staticmethod
    def notify_account_reactivated(account):
        NotificationService.create_notification(
            user=account.user,
            notification_type="ACCOUNT_APPROVED",
            title="Account Reactivated",
            message=f"Your account ({account.account_number}) has been reactivated.",
        )

    @staticmethod
    def notify_account_frozen(account, reason=""):
        msg = f"Your account ({account.account_number}) has been frozen."
        if reason:
            msg += f" Reason: {reason}"
        NotificationService.create_notification(
            user=account.user,
            notification_type="ACCOUNT_FROZEN",
            title="Account Frozen",
            message=msg,
            send_email=False,
        )
        send_account_frozen_email(account.user.email, account.user.full_name, account.account_number, reason)

    @staticmethod
    def notify_account_locked(account, reason=""):
        msg = f"Your account ({account.account_number}) has been locked."
        if reason:
            msg += f" Reason: {reason}"
        NotificationService.create_notification(
            user=account.user,
            notification_type="ACCOUNT_FROZEN",
            title="Account Locked",
            message=msg,
        )

    @staticmethod
    def notify_account_unlocked(account):
        NotificationService.create_notification(
            user=account.user,
            notification_type="ACCOUNT_APPROVED",
            title="Account Unlocked",
            message=f"Your account ({account.account_number}) has been unlocked.",
        )

    @staticmethod
    def notify_deposit(user, amount, account_number, balance_after="", deposit_type="Cash Deposit", reference=""):
        now = timezone.now().strftime("%d %b %Y, %H:%M")
        NotificationService.create_notification(
            user=user,
            notification_type="DEPOSIT",
            title="Deposit Successful",
            message=f"£{amount} has been deposited to your account ({account_number}).",
            send_email=False,
        )
        send_deposit_email(
            user.email,
            user.full_name,
            f"£{amount}",
            account_number,
            f"£{balance_after}" if balance_after else "",
            deposit_type=deposit_type,
            reference=reference,
            timestamp=now,
        )

    @staticmethod
    def notify_withdrawal(user, amount, account_number, balance_after="", reference=""):
        now = timezone.now().strftime("%d %b %Y, %H:%M")
        NotificationService.create_notification(
            user=user,
            notification_type="WITHDRAWAL",
            title="Withdrawal Successful",
            message=f"£{amount} has been withdrawn from your account ({account_number}).",
            send_email=False,
        )
        send_withdrawal_email(
            user.email,
            user.full_name,
            f"£{amount}",
            account_number,
            f"£{balance_after}" if balance_after else "",
            reference=reference,
            timestamp=now,
        )

    @staticmethod
    def notify_transfer_sent(user, amount, to_account, fee="0", balance_after="", recipient_name="",
                             sender_account="", reference=""):
        now = timezone.now().strftime("%d %b %Y, %H:%M")
        NotificationService.create_notification(
            user=user,
            notification_type="TRANSFER_SENT",
            title="Transfer Sent",
            message=f"You sent £{amount} to account {to_account}. Fee: £{fee}.",
            send_email=False,
        )
        send_transfer_sent_email(
            user.email,
            user.full_name,
            f"£{amount}",
            recipient_name or "Recipient",
            to_account,
            sender_account or "",
            f"£{balance_after}" if balance_after else "",
            reference=reference,
            fee=f"£{fee}",
            timestamp=now,
        )

    @staticmethod
    def notify_transfer_received(user, amount, from_name, from_account="", reference=""):
        now = timezone.now().strftime("%d %b %Y, %H:%M")
        msg = f"You received £{amount} from {from_name}"
        if from_account:
            msg += f" (Account: {from_account})"
        msg += "."
        NotificationService.create_notification(
            user=user,
            notification_type="TRANSFER_RECEIVED",
            title="Transfer Received",
            message=msg,
            send_email=False,
        )
        send_transfer_received_email(
            user.email,
            user.full_name,
            f"£{amount}",
            from_name,
            from_account,
            reference=reference,
            timestamp=now,
        )

    @staticmethod
    def notify_password_reset(user):
        NotificationService.create_notification(
            user=user,
            notification_type="PASSWORD_RESET",
            title="Password Reset",
            message="Your password has been reset by an administrator.",
            send_email=False,
        )
        send_password_changed_email(user.email, user.full_name)

    @staticmethod
    def notify_password_reset_request(user, reset_url):
        NotificationService.create_notification(
            user=user,
            notification_type="PASSWORD_RESET",
            title="Password Reset Requested",
            message="A password reset was requested for your account.",
            send_email=False,
        )
        send_password_reset_email(user.email, user.full_name, reset_url)

    @staticmethod
    def notify_password_changed(user):
        NotificationService.create_notification(
            user=user,
            notification_type="PASSWORD_RESET",
            title="Password Changed",
            message="Your password was successfully changed.",
            send_email=False,
        )
        send_password_changed_email(user.email, user.full_name)

    @staticmethod
    def notify_suspicious_login(user, ip_address="", location=""):
        now = timezone.now().strftime("%d %b %Y, %H:%M")
        NotificationService.create_notification(
            user=user,
            notification_type="ACCOUNT_FROZEN",
            title="Suspicious Login Attempt",
            message=f"A suspicious login attempt was detected from {ip_address} ({location}).",
            send_email=False,
        )
        send_suspicious_login_email(
            user.email,
            user.full_name,
            ip_address=ip_address,
            location=location,
            timestamp=now,
        )

    @staticmethod
    def notify_kyc_submitted(user):
        NotificationService.create_notification(
            user=user,
            notification_type="KYC_REMINDER",
            title="KYC Documents Submitted",
            message="Your KYC documents have been submitted and are under review.",
            send_email=False,
        )
        send_kyc_submitted_email(user.email, user.full_name)

    @staticmethod
    def notify_kyc_approved(user):
        NotificationService.create_notification(
            user=user,
            notification_type="VERIFICATION_APPROVED",
            title="Verification Approved",
            message="Your identity verification has been approved. Your account is now active.",
            send_email=False,
        )
        send_kyc_approved_email(user.email, user.full_name)

    @staticmethod
    def notify_kyc_rejected(user, reason=""):
        msg = "Your identity verification was rejected."
        if reason:
            msg += f" Reason: {reason}"
        NotificationService.create_notification(
            user=user,
            notification_type="VERIFICATION_REJECTED",
            title="Verification Rejected",
            message=msg,
            send_email=False,
        )
        send_kyc_rejected_email(user.email, user.full_name, reason)

    @staticmethod
    def notify_kyc_changes_requested(user, reason=""):
        NotificationService.create_notification(
            user=user,
            notification_type="KYC_REMINDER",
            title="Additional Documents Required",
            message=f"Please resubmit your documents. Reason: {reason}",
            send_email=False,
        )
        send_kyc_rejected_email(user.email, user.full_name, reason)

    @staticmethod
    def notify_admin_new_account(user, account_type):
        from users.models import User
        admins = User.objects.filter(role__in=["ADMIN", "SUPER_ADMIN"])
        for admin in admins:
            NotificationService.create_notification(
                user=admin,
                notification_type="GENERAL",
                title="New Account Application",
                message=f"{user.full_name} ({user.email}) has applied for a new {account_type} account.",
                send_email=False,
            )

    @staticmethod
    def notify_admin_new_kyc(user):
        from users.models import User
        admins = User.objects.filter(role__in=["ADMIN", "SUPER_ADMIN"])
        for admin in admins:
            NotificationService.create_notification(
                user=admin,
                notification_type="GENERAL",
                title="KYC Submitted for Review",
                message=f"{user.full_name} ({user.email}) has submitted KYC documents for review.",
                send_email=False,
            )

    @staticmethod
    def notify_ticket_created(ticket):
        NotificationService.create_notification(
            user=ticket.customer,
            notification_type="GENERAL",
            title=f"Support Ticket Submitted (#{ticket.id})",
            message=f'Your support ticket "{ticket.subject}" has been submitted. Our team will review it shortly.',
            send_email=False,
        )
        send_ticket_created_email(ticket.customer.email, ticket.customer.full_name, ticket.id, ticket.subject)
        from users.models import User
        admins = User.objects.filter(role__in=["ADMIN", "SUPER_ADMIN"])
        for admin in admins:
            NotificationService.create_notification(
                user=admin,
                notification_type="GENERAL",
                title=f"New Support Ticket (#{ticket.id})",
                message=f"{ticket.customer.full_name} ({ticket.customer.email}) submitted a ticket: {ticket.subject}",
                send_email=False,
            )

    @staticmethod
    def notify_ticket_replied(ticket, reply_author_name, is_admin_reply, reply_preview=""):
        if is_admin_reply:
            NotificationService.create_notification(
                user=ticket.customer,
                notification_type="GENERAL",
                title=f"New Reply on Ticket #{ticket.id}",
                message=f'Support has replied to your ticket "{ticket.subject}". Log in to view the response.',
                send_email=False,
            )
            send_ticket_replied_email(
                ticket.customer.email,
                ticket.customer.full_name,
                ticket.id,
                ticket.subject,
                reply_preview=reply_preview,
            )
        else:
            from users.models import User
            admins = User.objects.filter(role__in=["ADMIN", "SUPER_ADMIN"])
            for admin in admins:
                NotificationService.create_notification(
                    user=admin,
                    notification_type="GENERAL",
                    title=f"Customer Reply on Ticket #{ticket.id}",
                    message=f"{ticket.customer.full_name} replied to ticket: {ticket.subject}",
                    send_email=False,
                )

    @staticmethod
    def notify_ticket_status_changed(ticket, old_status, new_status):
        status_labels = {"OPEN": "Open", "IN_PROGRESS": "In Progress", "RESOLVED": "Resolved", "CLOSED": "Closed"}
        NotificationService.create_notification(
            user=ticket.customer,
            notification_type="GENERAL",
            title=f"Ticket #{ticket.id} Status Updated",
            message=f'Your ticket "{ticket.subject}" status changed from {status_labels.get(old_status, old_status)} to {status_labels.get(new_status, new_status)}.',
            send_email=False,
        )
        if new_status == "RESOLVED":
            send_ticket_resolved_email(ticket.customer.email, ticket.customer.full_name, ticket.id, ticket.subject)

    @staticmethod
    def notify_message_received(message):
        NotificationService.create_notification(
            user=message.recipient,
            notification_type="GENERAL",
            title=f"New Message from {message.sender.full_name}",
            message=message.subject or message.body[:100],
        )

    @staticmethod
    def notify_card_issued(account):
        NotificationService.create_notification(
            user=account.user,
            notification_type="CARD_ISSUED",
            title="ATM Card Issued",
            message=f"Your debit card for account {account.account_number} has been issued. Card ending in {account.card_last_four}. Your card is now active.",
            send_email=False,
        )
        send_card_issued_email(
            account.user.email,
            account.user.full_name,
            account.account_number,
            account.card_last_four or "****",
        )

    @staticmethod
    def notify_card_blocked(account, reason=""):
        msg = f"Your debit card for account {account.account_number} has been blocked."
        if reason:
            msg += f" Reason: {reason}"
        NotificationService.create_notification(
            user=account.user,
            notification_type="CARD_BLOCKED",
            title="ATM Card Blocked",
            message=msg,
            send_email=False,
        )
        send_card_blocked_email(
            account.user.email,
            account.user.full_name,
            account.account_number,
            account.card_last_four or "****",
            reason=reason,
        )
