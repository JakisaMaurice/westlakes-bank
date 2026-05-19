from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Transaction
from .serializers import TransactionSerializer, TransactionCreateSerializer, DepositSerializer, WithdrawalSerializer, AdminDepositSerializer
from .services import TransactionService
from users.permissions import IsCustomer, IsAdmin


class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Transaction.objects.all()
        # Return transactions where user is sender or receiver
        return Transaction.objects.filter(
            Q(sender_account__user=user) | Q(receiver_account__user=user)
        ).distinct()


class TransactionDetailView(generics.RetrieveAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    queryset = Transaction.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Transaction.objects.all()
        # Return transactions where user is sender or receiver
        return Transaction.objects.filter(
            Q(sender_account__user=user) | Q(receiver_account__user=user)
        ).distinct()


class TransferView(generics.CreateAPIView):
    serializer_class = TransactionCreateSerializer
    permission_classes = [IsCustomer]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()

        # Process the transaction
        try:
            TransactionService.process_transaction(transaction)
            return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            transaction.status = 'FAILED'
            transaction.save()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DepositView(generics.CreateAPIView):
    serializer_class = DepositSerializer
    permission_classes = [IsCustomer]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()

        # Process the deposit
        try:
            TransactionService.process_transaction(transaction)
            return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            transaction.status = 'FAILED'
            transaction.save()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminDepositView(generics.CreateAPIView):
    serializer_class = AdminDepositSerializer
    permission_classes = [IsAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()

        # Process the deposit
        try:
            TransactionService.process_transaction(transaction)
            return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            transaction.status = 'FAILED'
            transaction.save()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class WithdrawalView(generics.CreateAPIView):
    serializer_class = WithdrawalSerializer
    permission_classes = [IsCustomer]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()

        # Process the withdrawal
        try:
            TransactionService.process_transaction(transaction)
            return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            transaction.status = 'FAILED'
            transaction.save()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

