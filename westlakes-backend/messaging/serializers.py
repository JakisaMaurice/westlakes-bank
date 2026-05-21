from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_name', 'recipient', 'recipient_name',
            'message_type', 'subject', 'body', 'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'is_read', 'read_at', 'created_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    recipient = serializers.PrimaryKeyRelatedField(queryset=get_user_model().objects.all())

    class Meta:
        model = Message
        fields = ['recipient', 'message_type', 'subject', 'body']

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class AdminExternalEmailSerializer(serializers.Serializer):
    recipient_email = serializers.EmailField()
    subject = serializers.CharField(max_length=255, allow_blank=True)
    body = serializers.CharField()

    def validate_recipient_email(self, value):
        return value.strip().lower()
