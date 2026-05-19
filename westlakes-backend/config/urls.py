from django.contrib import admin
from django.urls import path, include
from .contact_views import contact_message

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/contact/', contact_message, name='contact-message'),
    path('api/auth/', include('users.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/tickets/', include('tickets.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/admin/', include('reports.urls')),
    path('api/audit-logs/', include('audit_logs.urls')),
    path('api/messages/', include('messaging.urls')),
    path('api/kyc/', include('kyc.urls')),
]
