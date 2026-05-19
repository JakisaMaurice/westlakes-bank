from django.urls import path
from . import views

app_name = 'transactions'

urlpatterns = [
    path('', views.TransactionListView.as_view(), name='transaction-list'),
    path('<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    path('<int:transaction_id>/reverse/', views.reverse_transaction, name='reverse-transaction'),
    path('transfer/', views.TransferView.as_view(), name='transfer'),
    path('deposit/', views.DepositView.as_view(), name='deposit'),
    path('admin-deposit/', views.AdminDepositView.as_view(), name='admin-deposit'),
    path('withdraw/', views.WithdrawalView.as_view(), name='withdraw'),
]