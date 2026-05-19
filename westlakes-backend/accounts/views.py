from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import BankAccount
from .serializers import BankAccountSerializer, BankAccountCreateSerializer
from .services import AccountService
from users.permissions import IsCustomer, IsAdmin, IsOwnerOrAdmin


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


class BankAccountDetailView(generics.RetrieveAPIView):
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    queryset = BankAccount.objects.select_related('user').all()


@api_view(['POST'])
@permission_classes([IsAdmin])
def approve_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status != 'PENDING':
        return Response({'error': 'Account is not pending approval'}, status=status.HTTP_400_BAD_REQUEST)
    AccountService.approve_account(account, admin=request.user)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def reject_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status != 'PENDING':
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
