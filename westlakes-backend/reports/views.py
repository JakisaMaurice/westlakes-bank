from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta
from transactions.models import Transaction
from accounts.models import BankAccount
from users.models import User
from .models import Report
from .serializers import ReportSerializer, ReportCreateSerializer
from users.permissions import IsAdmin


class ReportListCreateView(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Report.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReportCreateSerializer
        return ReportSerializer


class ReportDetailView(generics.RetrieveAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAdmin]
    queryset = Report.objects.all()


@api_view(['GET'])
@permission_classes([IsAdmin])
def dashboard_analytics(request):
    """
    Get dashboard analytics data.
    """
    # Account statistics
    total_accounts = BankAccount.objects.count()
    active_accounts = BankAccount.objects.filter(status='ACTIVE').count()
    pending_accounts = BankAccount.objects.filter(status='PENDING_VERIFICATION').count()

    # Transaction statistics (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_transactions = Transaction.objects.filter(timestamp__gte=thirty_days_ago)
    total_transaction_volume = recent_transactions.aggregate(Sum('amount'))['amount__sum'] or 0
    transaction_count = recent_transactions.count()

    # Customer statistics
    total_customers = User.objects.filter(role='CUSTOMER').count()
    verified_customers = User.objects.filter(role='CUSTOMER', is_verified=True).count()

    # Monthly transaction trend (last 6 months)
    six_months_ago = datetime.now() - timedelta(days=180)
    monthly_transactions = (
        Transaction.objects
        .filter(timestamp__gte=six_months_ago, status='SUCCESSFUL')
        .annotate(month=TruncMonth('timestamp'))
        .values('month')
        .annotate(count=Count('id'), volume=Sum('amount'))
        .order_by('month')
    )

    data = {
        'accounts': {
            'total': total_accounts,
            'active': active_accounts,
            'pending': pending_accounts,
        },
        'transactions': {
            'recent_count': transaction_count,
            'recent_volume': float(total_transaction_volume),
        },
        'customers': {
            'total': total_customers,
            'verified': verified_customers,
        },
        'monthly_trend': list(monthly_transactions),
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdmin])
def transaction_summary_report(request):
    """
    Generate transaction summary report.
    """
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    queryset = Transaction.objects.filter(status='COMPLETED')

    if start_date:
        queryset = queryset.filter(timestamp__gte=start_date)
    if end_date:
        queryset = queryset.filter(timestamp__lte=end_date)

    summary = queryset.aggregate(
        total_count=Count('id'),
        total_volume=Sum('amount'),
        avg_amount=Avg('amount'),
    )

    # Breakdown by transaction type
    type_breakdown = queryset.values('transaction_type').annotate(
        count=Count('id'),
        volume=Sum('amount')
    ).order_by('-volume')

    data = {
        'summary': summary,
        'type_breakdown': list(type_breakdown),
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdmin])
def full_analytics(request):
    """
    Get comprehensive analytics for the reports page:
    - Customers joined per month
    - Deposits per month
    - Withdrawals per month
    - Transactions per month
    """
    six_months_ago = datetime.now() - timedelta(days=180)

    # Customers joined per month
    customers_joined = (
        User.objects
        .filter(role='CUSTOMER', created_at__gte=six_months_ago)
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )

    # Deposits per month
    deposits = (
        Transaction.objects
        .filter(transaction_type='DEPOSIT', status='SUCCESSFUL', timestamp__gte=six_months_ago)
        .annotate(month=TruncMonth('timestamp'))
        .values('month')
        .annotate(total=Sum('amount'))
        .order_by('month')
    )

    # Withdrawals per month
    withdrawals = (
        Transaction.objects
        .filter(transaction_type='WITHDRAWAL', status='SUCCESSFUL', timestamp__gte=six_months_ago)
        .annotate(month=TruncMonth('timestamp'))
        .values('month')
        .annotate(total=Sum('amount'))
        .order_by('month')
    )

    # All transactions per month
    transactions_monthly = (
        Transaction.objects
        .filter(status='SUCCESSFUL', timestamp__gte=six_months_ago)
        .annotate(month=TruncMonth('timestamp'))
        .values('month')
        .annotate(count=Count('id'), volume=Sum('amount'))
        .order_by('month')
    )

    data = {
        'customers_joined': [
            {'month': item['month'].isoformat(), 'count': item['count']}
            for item in customers_joined
        ],
        'deposits': [
            {'month': item['month'].isoformat(), 'total': float(item['total'] or 0)}
            for item in deposits
        ],
        'withdrawals': [
            {'month': item['month'].isoformat(), 'total': float(item['total'] or 0)}
            for item in withdrawals
        ],
        'transactions': [
            {'month': item['month'].isoformat(), 'count': item['count'], 'volume': float(item['volume'] or 0)}
            for item in transactions_monthly
        ],
    }

    return Response(data)
