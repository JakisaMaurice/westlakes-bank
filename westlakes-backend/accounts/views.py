from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import models
from django.shortcuts import get_object_or_404
from .models import BankAccount
from .serializers import BankAccountSerializer, BankAccountCreateSerializer
from .services import AccountService
from users.permissions import IsCustomer, IsAdmin, IsOwnerOrAdmin
from notifications.services import NotificationService


class BankAccountListCreateView(generics.ListCreateAPIView):
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return BankAccount.objects.select_related('user').all()
        return BankAccount.objects.filter(user=user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BankAccountCreateSerializer
        return BankAccountSerializer

    def perform_create(self, serializer):
        account = serializer.save()
        NotificationService.notify_admin_new_account(
            user=self.request.user,
            account_type=account.get_account_type_display(),
        )


class BankAccountDetailView(generics.RetrieveAPIView):
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    queryset = BankAccount.objects.select_related('user').all()


@api_view(['POST'])
@permission_classes([IsAdmin])
def approve_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status != 'PENDING_VERIFICATION':
        return Response({'error': 'Account is not pending approval'}, status=status.HTTP_400_BAD_REQUEST)
    AccountService.approve_account(account, admin=request.user)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def reject_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status != 'PENDING_VERIFICATION':
        return Response({'error': 'Account is not pending approval'}, status=status.HTTP_400_BAD_REQUEST)
    reason = request.data.get('reason', '')
    AccountService.reject_account(account, reason=reason, admin=request.user)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def suspend_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status != 'ACTIVE':
        return Response({'error': 'Account is not active'}, status=status.HTTP_400_BAD_REQUEST)
    reason = request.data.get('reason', '')
    AccountService.suspend_account(account, reason=reason, admin=request.user)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def activate_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status not in ['SUSPENDED', 'FROZEN', 'LOCKED']:
        return Response({'error': 'Account cannot be reactivated'}, status=status.HTTP_400_BAD_REQUEST)
    AccountService.activate_account(account, admin=request.user)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def freeze_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status != 'ACTIVE':
        return Response({'error': 'Only active accounts can be frozen'}, status=status.HTTP_400_BAD_REQUEST)
    reason = request.data.get('reason', '')
    AccountService.freeze_account(account, reason=reason, admin=request.user)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def lock_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status not in ['ACTIVE', 'FROZEN']:
        return Response({'error': 'Account cannot be locked'}, status=status.HTTP_400_BAD_REQUEST)
    reason = request.data.get('reason', '')
    AccountService.lock_account(account, reason=reason, admin=request.user)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def unlock_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status != 'LOCKED':
        return Response({'error': 'Account is not locked'}, status=status.HTTP_400_BAD_REQUEST)
    AccountService.unlock_account(account, admin=request.user)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdmin])
def atm_card_list(request):
    accounts = BankAccount.objects.select_related('user').order_by('-created_at')
    status_filter = request.query_params.get('status')
    if status_filter:
        accounts = accounts.filter(card_status=status_filter.upper())
    search = request.query_params.get('search')
    if search:
        accounts = accounts.filter(
            models.Q(account_number__icontains=search) |
            models.Q(card_number__icontains=search) |
            models.Q(user__full_name__icontains=search) |
            models.Q(user__email__icontains=search)
        )
    serializer = BankAccountSerializer(accounts, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def issue_atm_card(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status != 'ACTIVE':
        return Response({'error': 'Account must be active to issue a card'}, status=status.HTTP_400_BAD_REQUEST)
    if account.card_status not in ['NOT_ISSUED', 'PENDING']:
        return Response({'error': f'Card already exists with status: {account.card_status}'}, status=status.HTTP_400_BAD_REQUEST)

    from accounts.models import generate_card_number, generate_cvv
    from django.utils import timezone
    from datetime import timedelta
    account.card_number = generate_card_number()
    account.card_cvv = generate_cvv()
    account.card_status = 'ACTIVE'
    account.card_expiry = timezone.now().date() + timedelta(days=365 * 4)
    account.card_issued_at = timezone.now()
    account.save()

    NotificationService.notify_card_issued(account)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def block_atm_card(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.card_status != 'ACTIVE':
        return Response({'error': 'Card is not active'}, status=status.HTTP_400_BAD_REQUEST)
    reason = request.data.get('reason', 'Blocked by administrator')
    account.card_status = 'BLOCKED'
    account.card_blocked_reason = reason
    account.save()

    NotificationService.notify_card_blocked(account, reason)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def unblock_atm_card(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.card_status != 'BLOCKED':
        return Response({'error': 'Card is not blocked'}, status=status.HTTP_400_BAD_REQUEST)
    account.card_status = 'ACTIVE'
    account.card_blocked_reason = ''
    account.save()
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsCustomer])
def set_card_pin(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id, user=request.user)
    if account.card_status != 'ACTIVE':
        return Response({'error': 'Card is not active'}, status=status.HTTP_400_BAD_REQUEST)
    pin = request.data.get('pin')
    if not pin or len(pin) != 4 or not pin.isdigit():
        return Response({'error': 'PIN must be 4 digits'}, status=status.HTTP_400_BAD_REQUEST)
    account.set_card_pin(pin)
    account.save()
    return Response({'message': 'ATM PIN set successfully'})


@api_view(['GET'])
@permission_classes([IsCustomer])
def my_cards(request):
    accounts = BankAccount.objects.filter(
        user=request.user
    ).exclude(card_status='NOT_ISSUED').select_related('user')
    serializer = BankAccountSerializer(accounts, many=True)
    return Response(serializer.data)
