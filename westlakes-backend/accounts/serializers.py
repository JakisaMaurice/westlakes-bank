from rest_framework import serializers
from .models import BankAccount


class BankAccountSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    currency_display = serializers.CharField(source='get_currency_display', read_only=True)
    account_type_display = serializers.CharField(source='get_account_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    card_status_label = serializers.SerializerMethodField()
    card_last_four_digits = serializers.SerializerMethodField()

    class Meta:
        model = BankAccount
        fields = [
            'id', 'user', 'user_name', 'account_number', 'account_type', 'account_type_display',
            'currency', 'currency_display', 'nickname', 'balance', 'status', 'status_display',
            'reason', 'created_at',
            'card_number', 'card_cvv', 'card_status', 'card_status_label', 'card_last_four_digits',
            'card_expiry', 'card_daily_limit', 'card_issued_at', 'card_blocked_reason',
        ]
        read_only_fields = [
            'id', 'account_number', 'created_at',
            'card_number', 'card_cvv', 'card_issued_at', 'card_status_label', 'card_last_four_digits',
        ]

    def get_card_status_label(self, obj):
        return obj.card_status_display

    def get_card_last_four_digits(self, obj):
        return obj.card_last_four


class BankAccountCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = ['account_type', 'currency', 'nickname', 'reason']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = 'PENDING_VERIFICATION'
        return super().create(validated_data)


class BankAccountUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = ['status']
