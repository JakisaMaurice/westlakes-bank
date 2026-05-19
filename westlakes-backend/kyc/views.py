from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction as db_transaction
from users.models import KYCVerification, UploadedDocument
from .serializers import (
    KYCVerificationSerializer, UploadedDocumentSerializer,
    DocumentUploadSerializer, KYCSubmissionSerializer,
    KYCApprovalSerializer, KYCRejectionSerializer
)
from users.permissions import IsCustomer, IsAdmin
from notifications.models import Notification
from audit_logs.models import AuditLog


class MyKYCStatusView(generics.RetrieveAPIView):
    serializer_class = KYCVerificationSerializer
    permission_classes = [IsCustomer]

    def get_object(self):
        kyc, created = KYCVerification.objects.get_or_create(
            user=self.request.user,
            defaults={'status': 'PENDING_VERIFICATION'}
        )
        return kyc


class UploadDocumentView(generics.CreateAPIView):
    serializer_class = DocumentUploadSerializer
    permission_classes = [IsCustomer]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        kyc, _ = KYCVerification.objects.get_or_create(
            user=request.user,
            defaults={'status': 'PENDING_VERIFICATION'}
        )

        if kyc.is_approved:
            return Response(
                {'error': 'KYC already approved. Cannot upload new documents.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        file = serializer.validated_data['file']
        document = UploadedDocument.objects.create(
            kyc_verification=kyc,
            document_type=serializer.validated_data['document_type'],
            file=file,
            original_filename=file.name,
            file_size=file.size,
            mime_type=file.content_type
        )

        if kyc.status == 'REJECTED':
            kyc.status = 'PENDING_REVIEW'
            kyc.rejection_reason = ''
            kyc.save()

        return Response(
            UploadedDocumentSerializer(document, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class SubmitKYCView(generics.GenericAPIView):
    serializer_class = KYCSubmissionSerializer
    permission_classes = [IsCustomer]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        kyc, _ = KYCVerification.objects.get_or_create(
            user=request.user,
            defaults={'status': 'PENDING_VERIFICATION'}
        )

        if kyc.is_approved:
            return Response(
                {'error': 'KYC already approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with db_transaction.atomic():
            kyc.status = 'PENDING_REVIEW'
            kyc.submitted_at = kyc.submitted_at or __import__('django.utils.timezone').utils.timezone.now()
            kyc.rejection_reason = ''
            kyc.save()

            AuditLog.objects.create(
                customer=request.user,
                action='KYC_SUBMITTED',
                notes='KYC documents submitted for review'
            )

        return Response(
            KYCVerificationSerializer(kyc, context={'request': request}).data
        )


class DeleteDocumentView(generics.DestroyAPIView):
    permission_classes = [IsCustomer]

    def get_queryset(self):
        return UploadedDocument.objects.filter(kyc_verification__user=self.request.user)

    def perform_destroy(self, instance):
        if instance.kyc_verification.is_approved:
            raise Exception('Cannot delete documents from approved KYC.')
        instance.delete()


class AdminKYCListView(generics.ListAPIView):
    serializer_class = KYCVerificationSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = KYCVerification.objects.select_related(
            'user', 'reviewed_by'
        ).prefetch_related('documents').all()

        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                __import__('django.db.models', fromlist=['Q']).Q(
                    user__full_name__icontains=search
                ) | __import__('django.db.models', fromlist=['Q']).Q(
                    user__email__icontains=search
                )
            )

        return queryset.order_by('-updated_at')


class AdminKYCDetailView(generics.RetrieveAPIView):
    serializer_class = KYCVerificationSerializer
    permission_classes = [IsAdmin]
    queryset = KYCVerification.objects.select_related('user', 'reviewed_by').prefetch_related('documents').all()


class AdminApproveKYCView(generics.GenericAPIView):
    serializer_class = KYCApprovalSerializer
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        kyc = get_object_or_404(KYCVerification, pk=pk)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if kyc.is_approved:
            return Response({'error': 'KYC already approved.'}, status=status.HTTP_400_BAD_REQUEST)

        with db_transaction.atomic():
            previous_status = kyc.status
            kyc.status = 'APPROVED'
            kyc.reviewed_by = request.user
            kyc.reviewed_at = __import__('django.utils.timezone').utils.timezone.now()
            kyc.admin_notes = serializer.validated_data.get('admin_notes', '')
            kyc.save()

            kyc.user.is_verified = True
            kyc.user.save()

            from accounts.models import BankAccount
            BankAccount.objects.filter(
                user=kyc.user,
                status='PENDING_VERIFICATION'
            ).update(status='ACTIVE')

            Notification.objects.create(
                user=kyc.user,
                notification_type='VERIFICATION_APPROVED',
                title='Verification Approved',
                message='Your identity verification has been approved. Your account is now active.'
            )

            AuditLog.objects.create(
                admin=request.user,
                customer=kyc.user,
                action='KYC_APPROVED',
                previous_value={'status': previous_status},
                new_value={'status': 'APPROVED'},
                notes=serializer.validated_data.get('admin_notes', '')
            )

        return Response(KYCVerificationSerializer(kyc, context={'request': request}).data)


class AdminRejectKYCView(generics.GenericAPIView):
    serializer_class = KYCRejectionSerializer
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        kyc = get_object_or_404(KYCVerification, pk=pk)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if kyc.is_rejected:
            return Response({'error': 'KYC already rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        with db_transaction.atomic():
            previous_status = kyc.status
            kyc.status = 'REJECTED'
            kyc.rejection_reason = serializer.validated_data['rejection_reason']
            kyc.reviewed_by = request.user
            kyc.reviewed_at = __import__('django.utils.timezone').utils.timezone.now()
            kyc.admin_notes = serializer.validated_data.get('admin_notes', '')
            kyc.save()

            Notification.objects.create(
                user=kyc.user,
                notification_type='VERIFICATION_REJECTED',
                title='Verification Rejected',
                message=f'Your identity verification was rejected. Reason: {kyc.rejection_reason}'
            )

            AuditLog.objects.create(
                admin=request.user,
                customer=kyc.user,
                action='KYC_REJECTED',
                previous_value={'status': previous_status},
                new_value={'status': 'REJECTED', 'reason': kyc.rejection_reason},
                notes=serializer.validated_data.get('admin_notes', '')
            )

        return Response(KYCVerificationSerializer(kyc, context={'request': request}).data)


class AdminRequestChangesKYCView(generics.GenericAPIView):
    serializer_class = KYCRejectionSerializer
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        kyc = get_object_or_404(KYCVerification, pk=pk)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with db_transaction.atomic():
            previous_status = kyc.status
            kyc.status = 'PENDING_VERIFICATION'
            kyc.rejection_reason = serializer.validated_data['rejection_reason']
            kyc.reviewed_by = request.user
            kyc.reviewed_at = __import__('django.utils.timezone').utils.timezone.now()
            kyc.admin_notes = serializer.validated_data.get('admin_notes', '')
            kyc.save()

            Notification.objects.create(
                user=kyc.user,
                notification_type='KYC_REMINDER',
                title='Additional Documents Required',
                message=f'Please resubmit your documents. Reason: {kyc.rejection_reason}'
            )

            AuditLog.objects.create(
                admin=request.user,
                customer=kyc.user,
                action='KYC_REJECTED',
                previous_value={'status': previous_status},
                new_value={'status': 'PENDING_VERIFICATION', 'reason': kyc.rejection_reason},
                notes='Changes requested'
            )

        return Response(KYCVerificationSerializer(kyc, context={'request': request}).data)
