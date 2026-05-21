from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import Transaction
from .serializers import TransactionSerializer, TransactionCreateSerializer, DepositSerializer, WithdrawalSerializer, AdminDepositSerializer, ATMWithdrawalSerializer
from .services import TransactionService
from users.permissions import IsCustomer, IsAdmin


class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            queryset = Transaction.objects.all()
        else:
            queryset = Transaction.objects.filter(
                Q(sender_account__user=user) | Q(receiver_account__user=user)
            ).distinct()

        transaction_type = self.request.query_params.get('type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type.upper())

        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(timestamp__date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(timestamp__date__lte=date_to)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(transaction_reference__icontains=search) |
                Q(description__icontains=search) |
                Q(sender_account__account_number__icontains=search) |
                Q(receiver_account__account_number__icontains=search)
            )

        return queryset


class TransactionDetailView(generics.RetrieveAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    queryset = Transaction.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Transaction.objects.all()
        return Transaction.objects.filter(
            Q(sender_account__user=user) | Q(receiver_account__user=user)
        ).distinct()


class TransferView(generics.CreateAPIView):
    serializer_class = TransactionCreateSerializer
    permission_classes = [IsCustomer]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        is_external = serializer.validated_data.get('is_external', False)
        recipient_name = serializer.validated_data.get('recipient_name', '')
        external_account_number = serializer.validated_data.get('external_account_number', '')
        external_bank_name = serializer.validated_data.get('external_bank_name', '')

        transaction = serializer.save()

        from .models import Transfer
        Transfer.objects.create(
            transaction=transaction,
            transfer_type='EXTERNAL' if is_external else 'INTERNAL',
            recipient_name=recipient_name,
            external_account_number=external_account_number,
            external_bank_name=external_bank_name,
            confirmation_pin_used=True,
            confirmed_at=timezone.now(),
        )

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

        from .models import Deposit
        deposit_type = request.data.get('deposit_type', 'CASH')
        Deposit.objects.create(
            transaction=transaction,
            deposit_type=deposit_type,
            source_account_number=request.data.get('source_account_number', ''),
            source_platform=request.data.get('source_platform', ''),
            source_reference=request.data.get('source_reference', ''),
        )

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

        from .models import Deposit
        deposit_type = request.data.get('deposit_type', 'CASH')
        Deposit.objects.create(
            transaction=transaction,
            deposit_type=deposit_type,
            processed_by=request.user,
            source_account_number=request.data.get('source_account_number', ''),
            source_platform=request.data.get('source_platform', ''),
            source_reference=request.data.get('source_reference', ''),
        )

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

        try:
            TransactionService.process_transaction(transaction)
            return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            transaction.status = 'FAILED'
            transaction.save()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdmin])
def reverse_transaction(request, transaction_id):
    from django.shortcuts import get_object_or_404
    transaction = get_object_or_404(Transaction, id=transaction_id)
    reason = request.data.get('reason', '')

    try:
        TransactionService.reverse_transaction(transaction, reason=reason, admin=request.user)
        return Response(TransactionSerializer(transaction).data)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ATMWithdrawalView(generics.CreateAPIView):
    serializer_class = ATMWithdrawalSerializer
    permission_classes = [IsCustomer]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()

        try:
            TransactionService.process_transaction(transaction)
            return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            transaction.status = 'FAILED'
            transaction.save()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
