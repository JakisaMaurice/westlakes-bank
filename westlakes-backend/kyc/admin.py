from django.contrib import admin
from users.models import KYCVerification, UploadedDocument


class UploadedDocumentInline(admin.TabularInline):
    model = UploadedDocument
    extra = 0
    readonly_fields = ['uploaded_at']


@admin.register(KYCVerification)
class KYCVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'submitted_at', 'reviewed_at', 'reviewed_by']
    list_filter = ['status']
    search_fields = ['user__full_name', 'user__email']
    inlines = [UploadedDocumentInline]


@admin.register(UploadedDocument)
class UploadedDocumentAdmin(admin.ModelAdmin):
    list_display = ['kyc_verification', 'document_type', 'original_filename', 'uploaded_at']
    list_filter = ['document_type']
