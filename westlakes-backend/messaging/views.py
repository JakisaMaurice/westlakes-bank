from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import models
from django.shortcuts import get_object_or_404
from .models import Message
from .serializers import MessageSerializer, MessageCreateSerializer
from notifications.services import NotificationService


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
