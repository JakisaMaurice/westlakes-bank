from rest_framework import serializers
from .models import Transaction
from accounts.models import BankAccount


class TransactionSerializer(serializers.ModelSerializer):
    sender_account_number = serializers.CharField(source='sender_account.account_number', read_only=True)
    receiver_account_number = serializers.CharField(source='receiver_account.account_number', read_only=True)
    sender_name = serializers.CharField(source='sender_account.user.full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver_account.user.full_name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'sender_account', 'receiver_account', 'sender_account_number',
            'receiver_account_number', 'sender_name', 'receiver_name',
            'transaction_type', 'amount', 'transaction_reference',
            'status', 'timestamp', 'description'
        ]
        read_only_fields = ['id', 'transaction_reference', 'timestamp']


class TransactionCreateSerializer(serializers.ModelSerializer):
    receiver_account_number = serializers.CharField(write_only=True)

    class Meta:
        model = Transaction
        fields = ['receiver_account_number', 'amount', 'description']

    def validate(self, attrs):
        user = self.context['request'].user
        amount = attrs['amount']

        # Get user's active account (assuming they have one primary account)
        try:
            sender_account = BankAccount.objects.get(user=user, status='ACTIVE')
        except BankAccount.DoesNotExist:
            raise serializers.ValidationError("No active account found")

        # Get receiver account
        try:
            receiver_account = BankAccount.objects.get(
                account_number=attrs['receiver_account_number'],
                status='ACTIVE'
            )
        except BankAccount.DoesNotExist:
            raise serializers.ValidationError("Invalid receiver account")

        # Check balance
        if sender_account.balance < amount:
            raise serializers.ValidationError("Insufficient balance")

        # Prevent self-transfer
        if sender_account == receiver_account:
            raise serializers.ValidationError("Cannot transfer to the same account")

        attrs['sender_account'] = sender_account
        attrs['receiver_account'] = receiver_account
        attrs['transaction_type'] = 'TRANSFER'

        return attrs

    def create(self, validated_data):
        validated_data.pop('receiver_account_number')
        return super().create(validated_data)


class DepositSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['amount', 'description']

    def validate(self, attrs):
        user = self.context['request'].user
        try:
            account = BankAccount.objects.get(user=user, status='ACTIVE')
            attrs['receiver_account'] = account
            attrs['transaction_type'] = 'DEPOSIT'
        except BankAccount.DoesNotExist:
            raise serializers.ValidationError("No active account found")
        return attrs

    def create(self, validated_data):
        return super().create(validated_data)


class WithdrawalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['amount', 'description']

    def validate(self, attrs):
        user = self.context['request'].user
        amount = attrs['amount']

        try:
            account = BankAccount.objects.get(user=user, status='ACTIVE')
        except BankAccount.DoesNotExist:
            raise serializers.ValidationError("No active account found")

        if account.balance < amount:
            raise serializers.ValidationError("Insufficient balance")

        attrs['sender_account'] = account
        attrs['transaction_type'] = 'WITHDRAWAL'

        return attrs

    def create(self, validated_data):
        return super().create(validated_data)


class AdminDepositSerializer(serializers.ModelSerializer):
    receiver_account_number = serializers.CharField(write_only=True)

    class Meta:
        model = Transaction
        fields = ['receiver_account_number', 'amount', 'description']

    def validate(self, attrs):
        # For admin deposits, we don't require the admin to have an account
        # We just need to validate the receiver account exists and is active
        receiver_account_number = attrs['receiver_account_number']
        try:
            receiver_account = BankAccount.objects.get(
                account_number=receiver_account_number,
                status='ACTIVE'
            )
        except BankAccount.DoesNotExist:
            raise serializers.ValidationError("Invalid receiver account")

        attrs['receiver_account'] = receiver_account
        attrs['transaction_type'] = 'DEPOSIT'
        # Admin doesn't need a sender account for deposits
        return attrs

    def create(self, validated_data):
        validated_data.pop('receiver_account_number')
        # Set sender_account to None for admin deposits
        validated_data['sender_account'] = None
        return super().create(validated_data)
