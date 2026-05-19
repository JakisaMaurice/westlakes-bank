from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='admin.full_name', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'admin', 'admin_name', 'customer', 'customer_name',
            'action', 'action_display', 'previous_value', 'new_value',
            'notes', 'ip_address', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']
