from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import models
from django.shortcuts import get_object_or_404
from .models import Message
from .serializers import MessageSerializer, MessageCreateSerializer, AdminExternalEmailSerializer
from notifications.services import NotificationService
from users.permissions import IsAdmin
from notifications.email_service import send_admin_email
from audit_logs.models import AuditLog


class MessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            customer_id = self.request.query_params.get('customer_id')
            if customer_id:
                return Message.objects.filter(recipient_id=customer_id).select_related('sender', 'recipient')
            return Message.objects.select_related('sender', 'recipient').all()
        return Message.objects.filter(
            models.Q(recipient=user) | models.Q(sender=user)
        ).select_related('sender', 'recipient')

    def perform_create(self, serializer):
        message = serializer.save()
        NotificationService.notify_message_received(message)


class MessageDetailView(generics.RetrieveAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Message.objects.select_related('sender', 'recipient').all()
        return Message.objects.filter(
            models.Q(recipient=user) | models.Q(sender=user)
        ).select_related('sender', 'recipient')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_message_read(request, message_id):
    message = get_object_or_404(Message, id=message_id)
    if request.user.is_admin or message.recipient == request.user or message.sender == request.user:
        message.mark_as_read()
        return Response(MessageSerializer(message).data)
    return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([IsAdmin])
def send_external_email(request):
    serializer = AdminExternalEmailSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    recipient_email = serializer.validated_data['recipient_email']
    subject = serializer.validated_data['subject']
    body = serializer.validated_data['body']
    admin = request.user

    success = send_admin_email(
        to_email=recipient_email,
        subject=subject,
        body_text=body,
        admin_name=admin.full_name,
    )

    AuditLog.objects.create(
        admin=admin,
        action='MESSAGE_SENT',
        new_value={
            'recipient_email': recipient_email,
            'subject': subject,
            'channel': 'external_email',
        },
        notes=f"External email sent to {recipient_email}",
    )

    if success:
        return Response({'detail': f'Email sent successfully to {recipient_email}'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Failed to send email. Email service may not be configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
