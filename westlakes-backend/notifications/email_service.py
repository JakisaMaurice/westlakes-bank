import logging
import os
from typing import Optional

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "notifications@westlakesbank.com")
SUPPORT_EMAIL = os.environ.get("SUPPORT_EMAIL", "support@westlakesbank.com")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
BANK_NAME = os.environ.get("BANK_NAME", "Westlakes Bank")

RESEND_API_URL = "https://api.resend.com/emails"


def _build_base_context(**kwargs) -> dict:
    return {
        "bank_name": BANK_NAME,
        "support_email": SUPPORT_EMAIL,
        "frontend_url": FRONTEND_URL,
        **kwargs,
    }


def _render_email(subject: str, content: str, button_text: str = "", button_url: str = "") -> str:
    button_html = ""
    if button_text and button_url:
        button_html = f"""
        <tr>
            <td align="center" style="padding: 24px 0 16px 0;">
                <a href="{button_url}" target="_blank"
                   style="display: inline-block; padding: 14px 36px; background-color: #1B3A6B; color: #ffffff;
                          text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;
                          font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
                    {button_text}
                </a>
            </td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{subject}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {{ font-family: 'Segoe UI', Helvetica, Arial, sans-serif !important; }}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F0F4F8; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F0F4F8;">
            <tr>
                <td align="center" style="padding: 32px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="600"
                           style="background-color: #ffffff; border-radius: 12px; overflow: hidden;
                                  box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #1B3A6B 0%, #2A5F9E 100%); padding: 32px 40px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
                                    {BANK_NAME}
                                </h1>
                            </td>
                        </tr>
                        <!-- Divider -->
                        <tr>
                            <td style="background-color: #E8B931; height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 36px 40px 24px 40px;">
                                {content}
                            </td>
                        </tr>
                        <!-- Button -->
                        {button_html}
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px 40px 32px 40px; border-top: 1px solid #E2E8F0;">
                                <p style="color: #94A3B8; font-size: 12px; line-height: 1.6; margin: 0; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
                                    This is an automated notification from {BANK_NAME}. Please do not reply to this email.
                                    If you need assistance, contact us at <a href="mailto:{SUPPORT_EMAIL}" style="color: #2A5F9E;">{SUPPORT_EMAIL}</a>.
                                </p>
                                <p style="color: #CBD5E1; font-size: 11px; margin: 8px 0 0 0; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
                                    &copy; 2026 {BANK_NAME}. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>"""


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str = "",
    from_email: str = None,
) -> bool:
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set. Email not sent to %s with subject '%s'", to_email, subject)
        return False

    from_email = from_email or f"{BANK_NAME} <{EMAIL_FROM}>"

    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }
    if text_content:
        payload["text"] = text_content

    try:
        response = requests.post(
            RESEND_API_URL,
            json=payload,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            timeout=15,
        )
        if response.status_code in (200, 201, 202):
            logger.info("Email sent successfully to %s — subject: '%s'", to_email, subject)
            return True
        else:
            logger.error(
                "Resend API error: status=%s, body=%s, recipient=%s",
                response.status_code,
                response.text,
                to_email,
            )
            return False
    except requests.RequestException as e:
        logger.error("Failed to send email to %s: %s", to_email, str(e))
        return False


def send_email_async(to_email: str, subject: str, html_content: str, text_content: str = "", from_email: str = None):
    import threading
    thread = threading.Thread(
        target=send_email,
        args=(to_email, subject, html_content, text_content, from_email),
        daemon=True,
    )
    thread.start()


def send_welcome_email(to_email: str, customer_name: str, account_number: str) -> bool:
    subject = f"Welcome to {BANK_NAME}"
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Welcome, {customer_name}!</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Thank you for choosing {BANK_NAME}. Your account has been created successfully and we're excited to have you on board.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
               style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin: 16px 0;">
            <tr>
                <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 8px 0; color: #64748B; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Account Number</p>
                    <p style="margin: 0; color: #1B3A6B; font-size: 22px; font-weight: 700; letter-spacing: 1px;">{account_number}</p>
                </td>
            </tr>
        </table>
        <h3 style="color: #1B3A6B; font-size: 16px; margin: 24px 0 12px 0;">Next Steps</h3>
        <ul style="color: #334155; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0 0 16px 0;">
            <li>Complete your KYC verification by uploading your documents</li>
            <li>Set up your transaction PIN for secure transfers</li>
            <li>Explore your online banking dashboard</li>
        </ul>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            Please verify your identity by completing the KYC process to unlock all banking features.
        </p>
    """
    html = _render_email(subject, content, "Go to Dashboard", f"{FRONTEND_URL}/dashboard")
    text = f"Welcome to {BANK_NAME}, {customer_name}! Your account number is {account_number}. Please complete your KYC verification."
    return send_email(to_email, subject, html, text)


def send_account_approved_email(to_email: str, customer_name: str, account_number: str, account_type: str) -> bool:
    subject = "Your Account Has Been Approved"
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Account Approved</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, we're pleased to inform you that your account application has been <strong style="color: #16A34A;">approved</strong> and is now active.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
               style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; margin: 16px 0;">
            <tr>
                <td style="padding: 20px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Account Number</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{account_number}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Account Type</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{account_type}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Status</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #16A34A; font-size: 15px;">Active</strong></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            You now have full access to all banking features including transfers, deposits, and withdrawals.
        </p>
    """
    html = _render_email(subject, content, "Access Your Account", f"{FRONTEND_URL}/dashboard")
    text = f"Dear {customer_name}, your {account_type} account ({account_number}) has been approved and is now active."
    return send_email(to_email, subject, html, text)


def send_account_rejected_email(to_email: str, customer_name: str, reason: str = "") -> bool:
    subject = "Account Application Update"
    reason_html = ""
    if reason:
        reason_html = f"""
        <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="color: #991B1B; font-size: 14px; margin: 0; font-weight: 600;">Reason for rejection:</p>
            <p style="color: #7F1D1D; font-size: 14px; margin: 8px 0 0 0; line-height: 1.6;">{reason}</p>
        </div>"""
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Application Update</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, we regret to inform you that your account application was not approved at this time.
        </p>
        {reason_html}
        <h3 style="color: #1B3A6B; font-size: 16px; margin: 24px 0 12px 0;">What You Can Do</h3>
        <ul style="color: #334155; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0 0 16px 0;">
            <li>Review the reason above and address any issues</li>
            <li>Contact our support team for clarification</li>
            <li>Resubmit your application with updated information</li>
        </ul>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            If you believe this decision was made in error, please reach out to us at <a href="mailto:{SUPPORT_EMAIL}" style="color: #2A5F9E;">{SUPPORT_EMAIL}</a>.
        </p>
    """
    html = _render_email(subject, content, "Contact Support", f"mailto:{SUPPORT_EMAIL}")
    text = f"Dear {customer_name}, your account application was not approved. Reason: {reason}. Contact {SUPPORT_EMAIL} for assistance."
    return send_email(to_email, subject, html, text)


def send_kyc_submitted_email(to_email: str, customer_name: str) -> bool:
    subject = "KYC Documents Received"
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Documents Received</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, we have successfully received your KYC documents and they are now under review.
        </p>
        <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="color: #1E40AF; font-size: 14px; margin: 0; font-weight: 600;">Expected Review Timeline</p>
            <p style="color: #1E3A8A; font-size: 14px; margin: 8px 0 0 0; line-height: 1.6;">Our team typically completes KYC reviews within <strong>1-3 business days</strong>. You will be notified once the review is complete.</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            We'll send you an email as soon as your verification is complete. Thank you for your patience.
        </p>
    """
    html = _render_email(subject, content, "View KYC Status", f"{FRONTEND_URL}/dashboard/kyc")
    text = f"Dear {customer_name}, your KYC documents have been received and are under review. Expected timeline: 1-3 business days."
    return send_email(to_email, subject, html, text)


def send_kyc_approved_email(to_email: str, customer_name: str) -> bool:
    subject = "KYC Verification Approved"
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Verification Successful</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, congratulations! Your identity verification has been <strong style="color: #16A34A;">successfully approved</strong>.
        </p>
        <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="color: #166534; font-size: 14px; margin: 0; font-weight: 600;">Banking Features Unlocked</p>
            <ul style="color: #166534; font-size: 14px; margin: 8px 0 0 0; padding-left: 20px; line-height: 1.8;">
                <li>Full access to all banking services</li>
                <li>Send and receive transfers</li>
                <li>ATM card requests</li>
                <li>Higher transaction limits</li>
            </ul>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            You can now enjoy the full range of {BANK_NAME} services.
        </p>
    """
    html = _render_email(subject, content, "Explore Your Account", f"{FRONTEND_URL}/dashboard")
    text = f"Dear {customer_name}, your KYC verification has been approved. All banking features are now unlocked."
    return send_email(to_email, subject, html, text)


def send_kyc_rejected_email(to_email: str, customer_name: str, reason: str = "") -> bool:
    subject = "KYC Verification Update"
    reason_html = ""
    if reason:
        reason_html = f"""
        <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="color: #991B1B; font-size: 14px; margin: 0; font-weight: 600;">Reason for rejection:</p>
            <p style="color: #7F1D1D; font-size: 14px; margin: 8px 0 0 0; line-height: 1.6;">{reason}</p>
        </div>"""
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Verification Update</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, we were unable to verify your identity with the documents provided.
        </p>
        {reason_html}
        <h3 style="color: #1B3A6B; font-size: 16px; margin: 24px 0 12px 0;">Resubmission Instructions</h3>
        <ul style="color: #334155; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0 0 16px 0;">
            <li>Ensure all documents are clear and legible</li>
            <li>Documents must be valid and not expired</li>
            <li>All four corners of the document must be visible</li>
            <li>Accepted formats: JPG, PNG, PDF</li>
        </ul>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            Please log in to your dashboard to resubmit your documents.
        </p>
    """
    html = _render_email(subject, content, "Resubmit Documents", f"{FRONTEND_URL}/dashboard/kyc")
    text = f"Dear {customer_name}, your KYC verification was rejected. Reason: {reason}. Please resubmit your documents."
    return send_email(to_email, subject, html, text)


def send_deposit_email(to_email: str, customer_name: str, amount: str, account_number: str, balance_after: str,
                       deposit_type: str = "Cash Deposit", reference: str = "", timestamp: str = "") -> bool:
    subject = "Deposit Confirmation"
    ref_row = f'<tr><td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Reference</span></td><td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{reference}</strong></td></tr>' if reference else ""
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Deposit Successful</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, a deposit has been credited to your account.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
               style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; margin: 16px 0;">
            <tr>
                <td style="padding: 20px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Amount Deposited</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #16A34A; font-size: 20px;">{amount}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Account</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{account_number}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Deposit Type</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{deposit_type}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Updated Balance</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{balance_after}</strong></td>
                        </tr>
                        {ref_row}
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Date & Time</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{timestamp}</strong></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            If you did not authorize this transaction, please contact us immediately.
        </p>
    """
    html = _render_email(subject, content, "View Transactions", f"{FRONTEND_URL}/dashboard/transactions")
    text = f"Dear {customer_name}, {amount} has been deposited to your account {account_number}. Updated balance: {balance_after}. Reference: {reference}."
    return send_email(to_email, subject, html, text)


def send_withdrawal_email(to_email: str, customer_name: str, amount: str, account_number: str, balance_after: str,
                          reference: str = "", timestamp: str = "") -> bool:
    subject = "Withdrawal Confirmation"
    ref_row = f'<tr><td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Reference</span></td><td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{reference}</strong></td></tr>' if reference else ""
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Withdrawal Successful</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, a withdrawal has been processed from your account.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
               style="background-color: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px; margin: 16px 0;">
            <tr>
                <td style="padding: 20px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Amount Withdrawn</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #C2410C; font-size: 20px;">{amount}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Account</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{account_number}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Remaining Balance</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{balance_after}</strong></td>
                        </tr>
                        {ref_row}
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Date & Time</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{timestamp}</strong></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            If you did not authorize this withdrawal, please contact us immediately.
        </p>
    """
    html = _render_email(subject, content, "View Transactions", f"{FRONTEND_URL}/dashboard/transactions")
    text = f"Dear {customer_name}, {amount} has been withdrawn from your account {account_number}. Remaining balance: {balance_after}. Reference: {reference}."
    return send_email(to_email, subject, html, text)


def send_transfer_sent_email(to_email: str, customer_name: str, amount: str, recipient_name: str,
                             recipient_account: str, sender_account: str, balance_after: str,
                             reference: str = "", fee: str = "0.00", timestamp: str = "") -> bool:
    subject = "Transfer Confirmation"
    ref_row = f'<tr><td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Reference</span></td><td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{reference}</strong></td></tr>' if reference else ""
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Transfer Successful</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, your transfer has been successfully processed.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
               style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; margin: 16px 0;">
            <tr>
                <td style="padding: 20px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Amount Transferred</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1E40AF; font-size: 20px;">{amount}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">From Account</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{sender_account}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">To</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{recipient_name}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Recipient Account</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{recipient_account}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Fee</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{fee}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Updated Balance</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{balance_after}</strong></td>
                        </tr>
                        {ref_row}
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Date & Time</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{timestamp}</strong></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            If you did not authorize this transfer, please contact us immediately.
        </p>
    """
    html = _render_email(subject, content, "View Transactions", f"{FRONTEND_URL}/dashboard/transactions")
    text = f"Dear {customer_name}, you sent {amount} to {recipient_name} ({recipient_account}). Fee: {fee}. Updated balance: {balance_after}. Reference: {reference}."
    return send_email(to_email, subject, html, text)


def send_transfer_received_email(to_email: str, customer_name: str, amount: str, sender_name: str,
                                 sender_account: str, reference: str = "", timestamp: str = "") -> bool:
    subject = "Incoming Transfer Notification"
    ref_row = f'<tr><td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Reference</span></td><td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{reference}</strong></td></tr>' if reference else ""
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">You've Received a Transfer</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, you have received an incoming transfer.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
               style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; margin: 16px 0;">
            <tr>
                <td style="padding: 20px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Amount Received</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #16A34A; font-size: 20px;">{amount}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">From</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{sender_name}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Sender Account</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{sender_account}</strong></td>
                        </tr>
                        {ref_row}
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Date & Time</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{timestamp}</strong></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            The funds have been credited to your account and are available for use.
        </p>
    """
    html = _render_email(subject, content, "View Transactions", f"{FRONTEND_URL}/dashboard/transactions")
    text = f"Dear {customer_name}, you received {amount} from {sender_name} ({sender_account}). Reference: {reference}."
    return send_email(to_email, subject, html, text)


def send_ticket_created_email(to_email: str, customer_name: str, ticket_id: int, subject_text: str) -> bool:
    subject = f"Support Ticket Submitted (#{ticket_id})"
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Ticket Received</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, your support ticket has been successfully submitted.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
               style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin: 16px 0;">
            <tr>
                <td style="padding: 20px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Ticket Number</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">#{ticket_id}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Subject</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{subject_text}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Status</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #CA8A04; font-size: 15px;">Open</strong></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            Our support team will review your ticket and respond as soon as possible. You can track the status from your dashboard.
        </p>
    """
    html = _render_email(subject, content, "View Ticket", f"{FRONTEND_URL}/dashboard/tickets")
    text = f"Dear {customer_name}, your support ticket #{ticket_id} '{subject_text}' has been submitted. Status: Open."
    return send_email(to_email, subject, html, text)


def send_ticket_replied_email(to_email: str, customer_name: str, ticket_id: int, subject_text: str,
                              reply_preview: str = "") -> bool:
    subject = f"New Reply on Ticket #{ticket_id}"
    preview_html = ""
    if reply_preview:
        preview_html = f"""
        <div style="background-color: #F8FAFC; border-left: 3px solid #2A5F9E; padding: 16px 20px; margin: 16px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #64748B; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Reply Preview</p>
            <p style="color: #334155; font-size: 14px; margin: 0; line-height: 1.6; font-style: italic;">"{reply_preview[:200]}{"..." if len(reply_preview) > 200 else ""}"</p>
        </div>"""
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">New Reply on Your Ticket</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, there is a new reply on your support ticket.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
               style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; margin: 16px 0;">
            <tr>
                <td style="padding: 20px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Ticket Number</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">#{ticket_id}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Subject</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{subject_text}</strong></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        {preview_html}
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            Log in to your dashboard to view the full reply and respond if needed.
        </p>
    """
    html = _render_email(subject, content, "View Ticket", f"{FRONTEND_URL}/dashboard/tickets")
    text = f"Dear {customer_name}, there is a new reply on your support ticket #{ticket_id} '{subject_text}'. Log in to view the response."
    return send_email(to_email, subject, html, text)


def send_ticket_resolved_email(to_email: str, customer_name: str, ticket_id: int, subject_text: str) -> bool:
    subject = f"Ticket #{ticket_id} Resolved"
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Ticket Resolved</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, your support ticket has been marked as <strong style="color: #16A34A;">resolved</strong>.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
               style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; margin: 16px 0;">
            <tr>
                <td style="padding: 20px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Ticket Number</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">#{ticket_id}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Subject</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{subject_text}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Status</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #16A34A; font-size: 15px;">Resolved</strong></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            If you feel your issue has not been fully addressed, you can reopen the ticket or create a new one.
        </p>
    """
    html = _render_email(subject, content, "View Ticket", f"{FRONTEND_URL}/dashboard/tickets")
    text = f"Dear {customer_name}, your support ticket #{ticket_id} '{subject_text}' has been resolved."
    return send_email(to_email, subject, html, text)


def send_password_reset_email(to_email: str, customer_name: str, reset_url: str) -> bool:
    subject = "Password Reset Request"
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Password Reset</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, we received a request to reset your password. Click the button below to set a new password.
        </p>
        <div style="background-color: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="color: #9A3412; font-size: 14px; margin: 0; font-weight: 600;">Security Notice</p>
            <p style="color: #9A3412; font-size: 14px; margin: 8px 0 0 0; line-height: 1.6;">
                This link will expire in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email or contact support immediately.
            </p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            For your security, this link can only be used once.
        </p>
    """
    html = _render_email(subject, content, "Reset Password", reset_url)
    text = f"Dear {customer_name}, click the link to reset your password: {reset_url}. This link expires in 1 hour."
    return send_email(to_email, subject, html, text)


def send_admin_email(to_email: str, subject: str, body_text: str, admin_name: str = "") -> bool:
    from notifications.services import NotificationService
    subject_text = subject or f"Message from {BANK_NAME}"
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">{subject_text}</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear Valued Customer,
        </p>
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px 24px; margin: 16px 0;">
            <p style="color: #334155; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap;">{body_text}</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            If you have any questions or concerns, please don't hesitate to contact us at <a href="mailto:{SUPPORT_EMAIL}" style="color: #2A5F9E;">{SUPPORT_EMAIL}</a>.
        </p>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            Best regards,<br/>
            <strong>{admin_name or BANK_NAME} Team</strong>
        </p>
    """
    html = _render_email(subject_text, content)
    text = f"Dear Valued Customer,\n\n{body_text}\n\nBest regards,\n{admin_name or BANK_NAME} Team\n\nContact us at {SUPPORT_EMAIL}"
    result = send_email(to_email, subject_text, html, text)
    return result


def send_password_changed_email(to_email: str, customer_name: str) -> bool:
    subject = "Password Changed Successfully"
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Password Changed</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, your password has been <strong style="color: #16A34A;">successfully changed</strong>.
        </p>
        <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="color: #166534; font-size: 14px; margin: 0; line-height: 1.6;">
                If you made this change, no further action is needed. Your account is secure.
            </p>
        </div>
        <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="color: #991B1B; font-size: 14px; margin: 0; font-weight: 600;">Didn't make this change?</p>
            <p style="color: #7F1D1D; font-size: 14px; margin: 8px 0 0 0; line-height: 1.6;">
                If you did not change your password, please contact us immediately at <a href="mailto:{SUPPORT_EMAIL}" style="color: #2A5F9E;">{SUPPORT_EMAIL}</a> to secure your account.
            </p>
        </div>
    """
    html = _render_email(subject, content, "Go to Dashboard", f"{FRONTEND_URL}/dashboard")
    text = f"Dear {customer_name}, your password has been changed. If you did not make this change, contact {SUPPORT_EMAIL} immediately."
    return send_email(to_email, subject, html, text)


def send_suspicious_login_email(to_email: str, customer_name: str, ip_address: str = "", location: str = "",
                                timestamp: str = "") -> bool:
    subject = "Suspicious Login Attempt Detected"
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Security Alert</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, we detected a suspicious login attempt on your account.
        </p>
        <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="color: #991B1B; font-size: 14px; margin: 0; font-weight: 600;">Login Details</p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 8px;">
                <tr><td style="padding: 3px 0;"><span style="color: #7F1D1D; font-size: 13px;">IP Address</span></td><td style="padding: 3px 0; text-align: right;"><strong style="color: #991B1B; font-size: 14px;">{ip_address or "Unknown"}</strong></td></tr>
                <tr><td style="padding: 3px 0;"><span style="color: #7F1D1D; font-size: 13px;">Location</span></td><td style="padding: 3px 0; text-align: right;"><strong style="color: #991B1B; font-size: 14px;">{location or "Unknown"}</strong></td></tr>
                <tr><td style="padding: 3px 0;"><span style="color: #7F1D1D; font-size: 13px;">Time</span></td><td style="padding: 3px 0; text-align: right;"><strong style="color: #991B1B; font-size: 14px;">{timestamp or "Unknown"}</strong></td></tr>
            </table>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 12px 0;">
            If this was you, you can safely ignore this email. If you do not recognize this activity, please secure your account immediately.
        </p>
    """
    html = _render_email(subject, content, "Secure Your Account", f"{FRONTEND_URL}/dashboard")
    text = f"Dear {customer_name}, suspicious login attempt detected from {ip_address} ({location}) at {timestamp}. If this wasn't you, contact us immediately."
    return send_email(to_email, subject, html, text)


def send_account_suspended_email(to_email: str, customer_name: str, account_number: str, reason: str = "") -> bool:
    subject = "Account Suspended"
    reason_html = f'<p style="color: #7F1D1D; font-size: 14px; margin: 8px 0 0 0; line-height: 1.6;">{reason}</p>' if reason else ""
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Account Suspended</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, your account <strong>{account_number}</strong> has been <strong style="color: #DC2626;">suspended</strong>.
        </p>
        <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="color: #991B1B; font-size: 14px; margin: 0; font-weight: 600;">Reason</p>
            {reason_html}
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            While your account is suspended, you will not be able to make transactions. Please contact our support team for assistance.
        </p>
    """
    html = _render_email(subject, content, "Contact Support", f"mailto:{SUPPORT_EMAIL}")
    text = f"Dear {customer_name}, your account {account_number} has been suspended. Reason: {reason}. Contact {SUPPORT_EMAIL}."
    return send_email(to_email, subject, html, text)


def send_account_frozen_email(to_email: str, customer_name: str, account_number: str, reason: str = "") -> bool:
    subject = "Account Frozen"
    reason_html = f'<p style="color: #7F1D1D; font-size: 14px; margin: 8px 0 0 0; line-height: 1.6;">{reason}</p>' if reason else ""
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Account Frozen</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, your account <strong>{account_number}</strong> has been <strong style="color: #2563EB;">frozen</strong>.
        </p>
        <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="color: #1E40AF; font-size: 14px; margin: 0; font-weight: 600;">Reason</p>
            {reason_html}
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            While your account is frozen, all transactions are temporarily blocked. Please contact our support team to resolve this.
        </p>
    """
    html = _render_email(subject, content, "Contact Support", f"mailto:{SUPPORT_EMAIL}")
    text = f"Dear {customer_name}, your account {account_number} has been frozen. Reason: {reason}. Contact {SUPPORT_EMAIL}."
    return send_email(to_email, subject, html, text)


def send_card_issued_email(to_email: str, customer_name: str, account_number: str, card_last_four: str) -> bool:
    subject = "Your ATM Card Has Been Issued"
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Card Issued</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, your debit card for account <strong>{account_number}</strong> has been issued and is now active.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
               style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin: 16px 0;">
            <tr>
                <td style="padding: 20px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Card Number</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 18px; letter-spacing: 2px;">**** **** **** {card_last_four}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Account</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #1B3A6B; font-size: 15px;">{account_number}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><span style="color: #64748B; font-size: 13px;">Status</span></td>
                            <td style="padding: 4px 0; text-align: right;"><strong style="color: #16A34A; font-size: 15px;">Active</strong></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            You can now use your card for ATM withdrawals and point-of-sale transactions. Remember to set your card PIN.
        </p>
    """
    html = _render_email(subject, content, "Manage Cards", f"{FRONTEND_URL}/dashboard/cards")
    text = f"Dear {customer_name}, your debit card for account {account_number} ending in {card_last_four} has been issued and is active."
    return send_email(to_email, subject, html, text)


def send_card_blocked_email(to_email: str, customer_name: str, account_number: str, card_last_four: str,
                            reason: str = "") -> bool:
    subject = "ATM Card Blocked"
    reason_html = f'<p style="color: #7F1D1D; font-size: 14px; margin: 8px 0 0 0; line-height: 1.6;">{reason}</p>' if reason else ""
    content = f"""
        <h2 style="color: #1B3A6B; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Card Blocked</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
            Dear {customer_name}, your debit card ending in <strong>{card_last_four}</strong> for account <strong>{account_number}</strong> has been <strong style="color: #DC2626;">blocked</strong>.
        </p>
        <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="color: #991B1B; font-size: 14px; margin: 0; font-weight: 600;">Reason</p>
            {reason_html}
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
            Your card cannot be used for transactions while blocked. If you did not request this, please contact us immediately.
        </p>
    """
    html = _render_email(subject, content, "Contact Support", f"mailto:{SUPPORT_EMAIL}")
    text = f"Dear {customer_name}, your debit card ending in {card_last_four} for account {account_number} has been blocked. Reason: {reason}."
    return send_email(to_email, subject, html, text)
