from rest_framework import serializers
from .models import Transaction, Transfer, Deposit
from accounts.models import BankAccount


class TransactionSerializer(serializers.ModelSerializer):
    sender_account_number = serializers.CharField(source='sender_account.account_number', read_only=True)
    receiver_account_number = serializers.CharField(source='receiver_account.account_number', read_only=True)
    sender_name = serializers.CharField(source='sender_account.user.full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver_account.user.full_name', read_only=True)
    deposit_type_display = serializers.CharField(source='get_deposit_type_display', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'sender_account', 'receiver_account', 'sender_account_number',
            'receiver_account_number', 'sender_name', 'receiver_name',
            'transaction_type', 'deposit_type', 'deposit_type_display',
            'amount', 'fee', 'transaction_reference',
            'status', 'timestamp', 'description', 'balance_after'
        ]
        read_only_fields = ['id', 'transaction_reference', 'timestamp', 'balance_after']


class TransactionCreateSerializer(serializers.ModelSerializer):
    receiver_account_number = serializers.CharField(write_only=True)
    transaction_pin = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Transaction
        fields = ['receiver_account_number', 'amount', 'description', 'transaction_pin']

    def validate(self, attrs):
        user = self.context['request'].user
        amount = attrs['amount']

        try:
            sender_account = BankAccount.objects.get(user=user, status='ACTIVE')
        except BankAccount.DoesNotExist:
            raise serializers.ValidationError("No active account found")

        try:
            receiver_account = BankAccount.objects.get(
                account_number=attrs['receiver_account_number'],
                status='ACTIVE'
            )
        except BankAccount.DoesNotExist:
            raise serializers.ValidationError("Invalid receiver account")

        if sender_account.balance < amount:
            raise serializers.ValidationError("Insufficient balance")

        if sender_account == receiver_account:
            raise serializers.ValidationError("Cannot transfer to the same account")

        if not user.transaction_pin:
            raise serializers.ValidationError("Please set a transaction PIN before making transfers")

        pin = attrs.get('transaction_pin')
        if not pin:
            raise serializers.ValidationError("Transaction PIN is required")
        if not user.check_transaction_pin(pin):
            raise serializers.ValidationError("Invalid transaction PIN")

        attrs['sender_account'] = sender_account
        attrs['receiver_account'] = receiver_account
        attrs['transaction_type'] = 'TRANSFER'

        return attrs

    def create(self, validated_data):
        validated_data.pop('receiver_account_number')
        validated_data.pop('transaction_pin', None)
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
    deposit_type = serializers.ChoiceField(choices=['CASH', 'BANK_TRANSFER', 'ADJUSTMENT', 'INTEREST'], default='CASH')

    class Meta:
        model = Transaction
        fields = ['receiver_account_number', 'amount', 'description', 'deposit_type']

    def validate(self, attrs):
        receiver_account_number = attrs['receiver_account_number']
        try:
            receiver_account = BankAccount.objects.get(
                account_number=receiver_account_number,
                status='ACTIVE'
            )
        except BankAccount.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive receiver account")

        if attrs['amount'] <= 0:
            raise serializers.ValidationError("Amount must be positive")

        attrs['receiver_account'] = receiver_account
        attrs['transaction_type'] = 'DEPOSIT'
        return attrs

    def create(self, validated_data):
        validated_data.pop('receiver_account_number')
        validated_data['sender_account'] = None
        return super().create(validated_data)


class TransferSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer(read_only=True)
    transfer_type_display = serializers.CharField(source='get_transfer_type_display', read_only=True)

    class Meta:
        model = Transfer
        fields = ['id', 'transaction', 'transfer_type', 'transfer_type_display', 'recipient_name', 'confirmation_pin_used', 'confirmed_at']


class DepositDetailSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer(read_only=True)
    deposit_type_display = serializers.CharField(source='get_deposit_type_display', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.full_name', read_only=True)

    class Meta:
        model = Deposit
        fields = ['id', 'transaction', 'deposit_type', 'deposit_type_display', 'processed_by', 'processed_by_name', 'reference_number']
