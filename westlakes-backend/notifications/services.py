import threading
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification


class NotificationService:

    @staticmethod
    def _send_email(to_email, subject, message):
        html_message = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #0A3D91; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">Westlakes Bank</h1>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
                <h2 style="color: #0F172A; margin-top: 0; font-size: 18px;">{subject}</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">{message}</p>
                <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        This is an automated notification from Westlakes Bank. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </div>
        """
        try:
            send_mail(
                subject=f"Westlakes Bank — {subject}",
                message=f"{subject}\n\n{message}\n\n— Westlakes Bank",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                html_message=html_message,
                fail_silently=True,
            )
        except Exception:
            pass

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
    def notify_account_approved(account):
        NotificationService.create_notification(
            user=account.user,
            notification_type="ACCOUNT_APPROVED",
            title="Account Approved",
            message=f"Your {account.account_type} account ({account.account_number}) has been approved and is now active.",
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
        )

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
        )

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
        )

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
    def notify_deposit(user, amount, account_number):
        NotificationService.create_notification(
            user=user,
            notification_type="DEPOSIT",
            title="Deposit Successful",
            message=f"£{amount} has been deposited to your account ({account_number}).",
        )

    @staticmethod
    def notify_transfer_sent(user, amount, to_account, fee="0"):
        NotificationService.create_notification(
            user=user,
            notification_type="TRANSFER_SENT",
            title="Transfer Sent",
            message=f"You sent £{amount} to account {to_account}. Fee: £{fee}.",
        )

    @staticmethod
    def notify_transfer_received(user, amount, from_name, from_account=""):
        msg = f"You received £{amount} from {from_name}"
        if from_account:
            msg += f" (Account: {from_account})"
        msg += "."
        NotificationService.create_notification(
            user=user,
            notification_type="TRANSFER_RECEIVED",
            title="Transfer Received",
            message=msg,
        )

    @staticmethod
    def notify_password_reset(user):
        NotificationService.create_notification(
            user=user,
            notification_type="PASSWORD_RESET",
            title="Password Reset",
            message="Your password has been reset by an administrator.",
        )

    @staticmethod
    def notify_kyc_approved(user):
        NotificationService.create_notification(
            user=user,
            notification_type="VERIFICATION_APPROVED",
            title="Verification Approved",
            message="Your identity verification has been approved. Your account is now active.",
        )

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
        )

    @staticmethod
    def notify_kyc_changes_requested(user, reason=""):
        NotificationService.create_notification(
            user=user,
            notification_type="KYC_REMINDER",
            title="Additional Documents Required",
            message=f"Please resubmit your documents. Reason: {reason}",
        )

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
    def notify_welcome(user):
        NotificationService.create_notification(
            user=user,
            notification_type="GENERAL",
            title="Welcome to Westlakes Bank",
            message="Please complete your account setup by uploading your KYC documents.",
        )

    @staticmethod
    def notify_ticket_created(ticket):
        NotificationService.create_notification(
            user=ticket.customer,
            notification_type="GENERAL",
            title=f"Support Ticket Submitted (#{ticket.id})",
            message=f'Your support ticket "{ticket.subject}" has been submitted. Our team will review it shortly.',
        )
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
    def notify_ticket_replied(ticket, reply_author_name, is_admin_reply):
        if is_admin_reply:
            NotificationService.create_notification(
                user=ticket.customer,
                notification_type="GENERAL",
                title=f"New Reply on Ticket #{ticket.id}",
                message=f'Support has replied to your ticket "{ticket.subject}". Log in to view the response.',
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
        )

    @staticmethod
    def notify_message_received(message):
        NotificationService.create_notification(
            user=message.recipient,
            notification_type="GENERAL",
            title=f"New Message from {message.sender.full_name}",
            message=message.subject or message.body[:100],
        )

    @staticmethod
    def notify_withdrawal(user, amount, account_number):
        NotificationService.create_notification(
            user=user,
            notification_type="WITHDRAWAL",
            title="Withdrawal Successful",
            message=f"£{amount} has been withdrawn from your account ({account_number}).",
        )

    @staticmethod
    def notify_card_issued(account):
        NotificationService.create_notification(
            user=account.user,
            notification_type="CARD_ISSUED",
            title="ATM Card Issued",
            message=f"Your debit card for account {account.account_number} has been issued. Card ending in {account.card_last_four}. Your card is now active.",
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
        )
