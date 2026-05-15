from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import BankAccount
from .serializers import BankAccountSerializer, BankAccountCreateSerializer, BankAccountUpdateSerializer
from .services import AccountService
from users.permissions import IsCustomer, IsAdmin, IsOwnerOrAdmin


class BankAccountListCreateView(generics.ListCreateAPIView):
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return BankAccount.objects.all()
        return BankAccount.objects.filter(user=user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BankAccountCreateSerializer
        return BankAccountSerializer


class BankAccountDetailView(generics.RetrieveAPIView):
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    queryset = BankAccount.objects.all()


@api_view(['POST'])
@permission_classes([IsAdmin])
def approve_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status != 'PENDING':
        return Response({'error': 'Account is not pending approval'}, status=status.HTTP_400_BAD_REQUEST)

    AccountService.approve_account(account)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def reject_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status != 'PENDING':
        return Response({'error': 'Account is not pending approval'}, status=status.HTTP_400_BAD_REQUEST)

    reason = request.data.get('reason', '')
    AccountService.reject_account(account, reason)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def suspend_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status != 'ACTIVE':
        return Response({'error': 'Account is not active'}, status=status.HTTP_400_BAD_REQUEST)

    reason = request.data.get('reason', '')
    AccountService.suspend_account(account, reason)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def activate_account(request, account_id):
    account = get_object_or_404(BankAccount, id=account_id)
    if account.status != 'SUSPENDED':
        return Response({'error': 'Account is not suspended'}, status=status.HTTP_400_BAD_REQUEST)

    AccountService.activate_account(account)
    serializer = BankAccountSerializer(account)
    return Response(serializer.data)

