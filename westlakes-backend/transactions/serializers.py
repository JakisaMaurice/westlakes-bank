from django.db import models
from rest_framework import serializers
from .models import Transaction, Transfer, Deposit
from accounts.models import BankAccount


class TransactionSerializer(serializers.ModelSerializer):
    sender_account_number = serializers.SerializerMethodField()
    receiver_account_number = serializers.SerializerMethodField()
    sender_name = serializers.CharField(source='sender_account.user.full_name', read_only=True)
    receiver_name = serializers.SerializerMethodField()
    transfer_type = serializers.SerializerMethodField()
    external_bank_name = serializers.SerializerMethodField()
    deposit_type_display = serializers.CharField(source='get_deposit_type_display', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'sender_account', 'receiver_account', 'sender_account_number',
            'receiver_account_number', 'sender_name', 'receiver_name',
            'transaction_type', 'transfer_type', 'external_bank_name',
            'deposit_type', 'deposit_type_display',
            'amount', 'fee', 'transaction_reference',
            'status', 'timestamp', 'description', 'balance_after'
        ]
        read_only_fields = ['id', 'transaction_reference', 'timestamp', 'balance_after']

    def get_sender_account_number(self, obj):
        return obj.sender_account.account_number if obj.sender_account else None

    def get_receiver_account_number(self, obj):
        if obj.receiver_account:
            return obj.receiver_account.account_number
        if hasattr(obj, 'transfer_details'):
            return obj.transfer_details.external_account_number or None
        return None

    def get_receiver_name(self, obj):
        if obj.receiver_account:
            return obj.receiver_account.user.full_name
        if hasattr(obj, 'transfer_details'):
            return obj.transfer_details.recipient_name or None
        return None

    def get_transfer_type(self, obj):
        if hasattr(obj, 'transfer_details'):
            return obj.transfer_details.transfer_type
        return None

    def get_external_bank_name(self, obj):
        if hasattr(obj, 'transfer_details'):
            return obj.transfer_details.external_bank_name or None
        return None


class TransactionCreateSerializer(serializers.ModelSerializer):
    receiver_account_number = serializers.CharField(write_only=True)
    transaction_pin = serializers.CharField(write_only=True, required=False)
    sender_account_id = serializers.IntegerField(write_only=True, required=False)
    external_bank_name = serializers.CharField(write_only=False, required=False, allow_blank=True)
    recipient_name_input = serializers.CharField(write_only=False, required=False, allow_blank=True)

    class Meta:
        model = Transaction
        fields = ['sender_account_id', 'receiver_account_number', 'amount', 'description', 'transaction_pin', 'external_bank_name', 'recipient_name_input']

    def validate(self, attrs):
        user = self.context['request'].user
        amount = attrs['amount']

        sender_account_id = attrs.get('sender_account_id')
        if sender_account_id:
            try:
                sender_account = BankAccount.objects.get(id=sender_account_id, user=user, status='ACTIVE')
            except BankAccount.DoesNotExist:
                raise serializers.ValidationError("No active account found with the specified ID")
        else:
            try:
                sender_account = BankAccount.objects.get(user=user, status='ACTIVE')
            except BankAccount.DoesNotExist:
                raise serializers.ValidationError("No active account found")

        receiver_account_number = attrs['receiver_account_number']
        receiver_account = None
        is_external = False

        try:
            receiver_account = BankAccount.objects.get(
                account_number=receiver_account_number,
                status='ACTIVE'
            )
        except BankAccount.DoesNotExist:
            is_external = True

        if not is_external and sender_account == receiver_account:
            raise serializers.ValidationError("Cannot transfer to the same account")

        total_debit = amount + TransactionService.calculate_fee(amount)
        if sender_account.balance < total_debit:
            raise serializers.ValidationError("Insufficient balance (including transfer fee)")

        if not user.transaction_pin:
            raise serializers.ValidationError("Please set a transaction PIN before making transfers")

        pin = attrs.get('transaction_pin')
        if not pin:
            raise serializers.ValidationError("Transaction PIN is required")
        if not user.check_transaction_pin(pin):
            raise serializers.ValidationError("Invalid transaction PIN")

        attrs['sender_account'] = sender_account
        attrs['receiver_account'] = receiver_account
        attrs['is_external'] = is_external
        attrs['transaction_type'] = 'TRANSFER'

        if is_external:
            ext_bank = attrs.get('external_bank_name', '')
            recipient_input = attrs.get('recipient_name_input', '')
            attrs['external_account_number'] = receiver_account_number
            attrs['external_bank_name'] = ext_bank
            attrs['recipient_name'] = recipient_input or receiver_account_number
        else:
            attrs['external_account_number'] = ''
            attrs['external_bank_name'] = ''
            attrs['recipient_name'] = receiver_account.user.full_name

        return attrs

    def create(self, validated_data):
        validated_data.pop('receiver_account_number')
        validated_data.pop('transaction_pin', None)
        validated_data.pop('sender_account_id', None)
        validated_data.pop('external_bank_name', None)
        validated_data.pop('recipient_name_input', None)
        return super().create(validated_data)


class DepositSerializer(serializers.ModelSerializer):
    deposit_type = serializers.ChoiceField(
        choices=['CASH', 'BANK_TRANSFER', 'ACCOUNT_TRANSFER', 'MOBILE_MONEY', 'ONLINE_PLATFORM'],
        default='CASH'
    )
    source_account_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    source_platform = serializers.CharField(write_only=True, required=False, allow_blank=True)
    source_reference = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Transaction
        fields = ['amount', 'description', 'deposit_type', 'source_account_number', 'source_platform', 'source_reference']

    def validate(self, attrs):
        user = self.context['request'].user
        deposit_type = attrs.get('deposit_type', 'CASH')

        try:
            account = BankAccount.objects.get(user=user, status='ACTIVE')
            attrs['receiver_account'] = account
            attrs['transaction_type'] = 'DEPOSIT'
        except BankAccount.DoesNotExist:
            raise serializers.ValidationError("No active account found")

        if attrs['amount'] <= 0:
            raise serializers.ValidationError("Amount must be positive")

        if deposit_type in ('ACCOUNT_TRANSFER', 'BANK_TRANSFER', 'MOBILE_MONEY', 'ONLINE_PLATFORM'):
            source_ref = attrs.get('source_reference', '')
            if not source_ref:
                raise serializers.ValidationError(
                    f"Source reference is required for {deposit_type.replace('_', ' ').lower()} deposits"
                )

        if deposit_type == 'MOBILE_MONEY':
            source_platform = attrs.get('source_platform', '')
            if not source_platform:
                raise serializers.ValidationError("Mobile money provider name is required (e.g., M-Pesa, MTN Mobile Money)")

        if deposit_type == 'ONLINE_PLATFORM':
            source_platform = attrs.get('source_platform', '')
            if not source_platform:
                raise serializers.ValidationError("Platform name is required (e.g., PayPal, Stripe)")

        return attrs

    def create(self, validated_data):
        return super().create(validated_data)


class WithdrawalSerializer(serializers.ModelSerializer):
    transaction_pin = serializers.CharField(write_only=True, required=True)
    atm_pin = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Transaction
        fields = ['amount', 'description', 'transaction_pin', 'atm_pin']

    def validate(self, attrs):
        user = self.context['request'].user
        amount = attrs['amount']

        try:
            account = BankAccount.objects.get(user=user, status='ACTIVE')
        except BankAccount.DoesNotExist:
            raise serializers.ValidationError("No active account found")

        if account.balance < amount:
            raise serializers.ValidationError("Insufficient balance")

        if not user.transaction_pin:
            raise serializers.ValidationError("Please set a transaction PIN before making withdrawals")

        pin = attrs.get('transaction_pin')
        if not pin:
            raise serializers.ValidationError("Transaction PIN is required")
        if not user.check_transaction_pin(pin):
            raise serializers.ValidationError("Invalid transaction PIN")

        if amount <= 0:
            raise serializers.ValidationError("Amount must be positive")

        daily_total = self._get_daily_withdrawal_total(account)
        if daily_total + amount > account.card_daily_limit:
            remaining = account.card_daily_limit - daily_total
            raise serializers.ValidationError(
                f"Daily withdrawal limit exceeded. Remaining today: £{remaining:.2f}"
            )

        attrs['sender_account'] = account
        attrs['transaction_type'] = 'WITHDRAWAL'
        return attrs

    @staticmethod
    def _get_daily_withdrawal_total(account):
        from django.utils import timezone
        from datetime import timedelta
        from .models import Transaction
        today = timezone.now().date()
        total = Transaction.objects.filter(
            sender_account=account,
            transaction_type='WITHDRAWAL',
            status='SUCCESSFUL',
            timestamp__date=today,
        ).aggregate(total=models.Sum('amount'))['total']
        return total or 0

    def create(self, validated_data):
        validated_data.pop('transaction_pin', None)
        validated_data.pop('atm_pin', None)
        return super().create(validated_data)


class ATMWithdrawalSerializer(serializers.ModelSerializer):
    atm_pin = serializers.CharField(write_only=True, required=True)
    card_number = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Transaction
        fields = ['amount', 'description', 'atm_pin', 'card_number']

    def validate(self, attrs):
        user = self.context['request'].user
        amount = attrs['amount']
        card_number = attrs['card_number']
        atm_pin = attrs.get('atm_pin')

        if not atm_pin or len(atm_pin) != 4:
            raise serializers.ValidationError("ATM PIN must be 4 digits")

        try:
            account = BankAccount.objects.get(
                card_number=card_number,
                user=user,
                card_status='ACTIVE',
                status='ACTIVE',
            )
        except BankAccount.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive card")

        if not account.check_card_pin(atm_pin):
            raise serializers.ValidationError("Invalid ATM PIN")

        if account.balance < amount:
            raise serializers.ValidationError("Insufficient balance")

        if amount <= 0:
            raise serializers.ValidationError("Amount must be positive")

        if amount > account.card_daily_limit:
            raise serializers.ValidationError(
                f"Amount exceeds daily limit of £{account.card_daily_limit:.2f}"
            )

        daily_total = self._get_daily_atm_total(account)
        if daily_total + amount > account.card_daily_limit:
            remaining = account.card_daily_limit - daily_total
            raise serializers.ValidationError(
                f"Daily ATM withdrawal limit exceeded. Remaining today: £{remaining:.2f}"
            )

        attrs['sender_account'] = account
        attrs['transaction_type'] = 'WITHDRAWAL'
        return attrs

    @staticmethod
    def _get_daily_atm_total(account):
        from django.utils import timezone
        from .models import Transaction
        today = timezone.now().date()
        total = Transaction.objects.filter(
            sender_account=account,
            transaction_type='WITHDRAWAL',
            status='SUCCESSFUL',
            timestamp__date=today,
            description__icontains='ATM',
        ).aggregate(total=models.Sum('amount'))['total']
        return total or 0

    def create(self, validated_data):
        validated_data.pop('atm_pin', None)
        validated_data.pop('card_number', None)
        validated_data['description'] = f"ATM Withdrawal: {validated_data.get('description', '')}"
        return super().create(validated_data)


class AdminDepositSerializer(serializers.ModelSerializer):
    receiver_account_number = serializers.CharField(write_only=True)
    deposit_type = serializers.ChoiceField(
        choices=['CASH', 'BANK_TRANSFER', 'ACCOUNT_TRANSFER', 'MOBILE_MONEY', 'ONLINE_PLATFORM', 'ADJUSTMENT', 'INTEREST'],
        default='CASH'
    )
    source_account_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    source_platform = serializers.CharField(write_only=True, required=False, allow_blank=True)
    source_reference = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Transaction
        fields = ['receiver_account_number', 'amount', 'description', 'deposit_type', 'source_account_number', 'source_platform', 'source_reference']

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
        fields = ['id', 'transaction', 'transfer_type', 'transfer_type_display', 'recipient_name', 'external_account_number', 'external_bank_name', 'confirmation_pin_used', 'confirmed_at']


class DepositDetailSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer(read_only=True)
    deposit_type_display = serializers.CharField(source='get_deposit_type_display', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.full_name', read_only=True)

    class Meta:
        model = Deposit
        fields = ['id', 'transaction', 'deposit_type', 'deposit_type_display', 'processed_by', 'processed_by_name', 'reference_number']
