from django.conf import settings
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, KYCVerification
from accounts.models import BankAccount


class UserSerializer(serializers.ModelSerializer):
    kyc_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'phone_number', 'national_id', 'role', 'is_verified', 'is_active', 'created_at', 'kyc_status']
        read_only_fields = ['id', 'is_verified', 'is_active', 'created_at']

    def get_kyc_status(self, obj):
        try:
            return obj.kyc_verification.get_status_display()
        except KYCVerification.DoesNotExist:
            return 'Not Started'


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['full_name', 'email', 'phone_number', 'national_id', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class AdminRegistrationSerializer(UserRegistrationSerializer):
    admin_code = serializers.CharField(write_only=True)

    class Meta(UserRegistrationSerializer.Meta):
        fields = UserRegistrationSerializer.Meta.fields + ['admin_code']

    def validate(self, attrs):
        attrs = super().validate(attrs)

        if not settings.ADMIN_REGISTRATION_CODE:
            raise serializers.ValidationError('Admin registration is not enabled.')

        if attrs.get('admin_code') != settings.ADMIN_REGISTRATION_CODE:
            raise serializers.ValidationError({'admin_code': 'Invalid admin registration code.'})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        validated_data.pop('admin_code', None)
        user = User.objects.create_user(
            role='ADMIN',
            is_staff=True,
            is_verified=True,
            **validated_data,
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password')


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['full_name', 'phone_number']


class TransactionPinSerializer(serializers.Serializer):
    pin = serializers.CharField(min_length=4, max_length=6)
    password = serializers.CharField()

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['password']):
            raise serializers.ValidationError('Invalid password')
        return attrs


class BankAccountBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = ['id', 'account_number', 'account_type', 'balance', 'status', 'created_at']


class CustomerAdminSerializer(serializers.ModelSerializer):
    accounts = BankAccountBriefSerializer(many=True, read_only=True)
    total_balance = serializers.SerializerMethodField()
    primary_account = serializers.SerializerMethodField()
    kyc_status = serializers.SerializerMethodField()
    kyc_status_code = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'phone_number', 'national_id',
            'role', 'is_verified', 'is_active', 'created_at',
            'accounts', 'total_balance', 'primary_account',
            'kyc_status', 'kyc_status_code'
        ]
        read_only_fields = ['id', 'role', 'created_at']

    def get_total_balance(self, obj):
        return str(sum(acc.balance for acc in obj.accounts.all()))

    def get_primary_account(self, obj):
        account = obj.accounts.first()
        if account:
            return BankAccountBriefSerializer(account).data
        return None

    def get_kyc_status(self, obj):
        try:
            return obj.kyc_verification.get_status_display()
        except KYCVerification.DoesNotExist:
            return 'Not Started'

    def get_kyc_status_code(self, obj):
        try:
            return obj.kyc_verification.status
        except KYCVerification.DoesNotExist:
            return 'NOT_STARTED'
