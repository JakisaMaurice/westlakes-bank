from rest_framework import serializers
from users.models import KYCVerification, UploadedDocument


class UploadedDocumentSerializer(serializers.ModelSerializer):
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = UploadedDocument
        fields = [
            'id', 'document_type', 'document_type_display', 'file', 'file_url',
            'original_filename', 'file_size', 'mime_type', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class KYCVerificationSerializer(serializers.ModelSerializer):
    documents = UploadedDocumentSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True)

    class Meta:
        model = KYCVerification
        fields = [
            'id', 'user', 'user_name', 'user_email', 'status', 'status_display',
            'rejection_reason', 'admin_notes', 'reviewed_by', 'reviewed_by_name',
            'submitted_at', 'reviewed_at', 'created_at', 'updated_at', 'documents'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DocumentUploadSerializer(serializers.Serializer):
    document_type = serializers.ChoiceField(choices=UploadedDocument.DOCUMENT_TYPE_CHOICES)
    file = serializers.FileField()

    def validate_file(self, value):
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError('Only JPG, PNG, and PDF files are allowed.')

        max_size = 10 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError('File size must be less than 10MB.')

        return value


class KYCSubmissionSerializer(serializers.Serializer):
    def validate(self, attrs):
        return attrs


class KYCApprovalSerializer(serializers.Serializer):
    admin_notes = serializers.CharField(required=False, allow_blank=True)


class KYCRejectionSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=True)
    admin_notes = serializers.CharField(required=False, allow_blank=True)
