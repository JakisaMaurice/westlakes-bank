from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import AuditLog
from .serializers import AuditLogSerializer
from users.permissions import IsAdmin


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['action', 'admin', 'customer']

    def get_queryset(self):
        queryset = AuditLog.objects.select_related('admin', 'customer').all()
        customer_id = self.request.query_params.get('customer_id')
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        return queryset
