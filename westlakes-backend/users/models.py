from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('CUSTOMER', 'Customer'),
        ('ADMIN', 'Admin'),
        ('SUPER_ADMIN', 'Super Admin'),
        ('CONSULTANT', 'Consultant'),
    ]

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    national_id = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='CUSTOMER')
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    transaction_pin = models.CharField(max_length=128, blank=True)
    password_reset_token = models.CharField(max_length=128, blank=True, default='')
    password_reset_expires = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    @property
    def is_customer(self):
        return self.role == 'CUSTOMER'

    @property
    def is_admin(self):
        return self.role in ['ADMIN', 'SUPER_ADMIN']

    @property
    def is_super_admin(self):
        return self.role == 'SUPER_ADMIN'

    @property
    def is_consultant(self):
        return self.role == 'CONSULTANT'

    def set_transaction_pin(self, raw_pin):
        from django.contrib.auth.hashers import make_password
        self.transaction_pin = make_password(raw_pin)

    def check_transaction_pin(self, raw_pin):
        from django.contrib.auth.hashers import check_password
        if not self.transaction_pin:
            return False
        return check_password(raw_pin, self.transaction_pin)


class KYCVerification(models.Model):
    STATUS_CHOICES = [
        ('PENDING_VERIFICATION', 'Pending Verification'),
        ('PENDING_REVIEW', 'Pending Review'),
        ('UNDER_VERIFICATION', 'Under Verification'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc_verification')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_VERIFICATION')
    rejection_reason = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_verifications'
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"KYC for {self.user.full_name} - {self.get_status_display()}"

    @property
    def is_pending(self):
        return self.status in ['PENDING_VERIFICATION', 'PENDING_REVIEW', 'UNDER_VERIFICATION']

    @property
    def is_approved(self):
        return self.status == 'APPROVED'

    @property
    def is_rejected(self):
        return self.status == 'REJECTED'

    class Meta:
        verbose_name = 'KYC Verification'
        verbose_name_plural = 'KYC Verifications'


class UploadedDocument(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('NATIONAL_ID', 'National ID'),
        ('PASSPORT', 'Passport'),
        ('PASSPORT_PHOTO', 'Passport Photo'),
        ('PROOF_OF_ADDRESS', 'Proof of Address'),
        ('SIGNATURE', 'Signature'),
        ('SUPPORTING', 'Supporting Document'),
    ]

    kyc_verification = models.ForeignKey(
        KYCVerification,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to='kyc_documents/%Y/%m/%d/')
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    mime_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.kyc_verification.user.full_name}"

    class Meta:
        ordering = ['-uploaded_at']
