from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('', views.ReportListCreateView.as_view(), name='report-list-create'),
    path('<int:pk>/', views.ReportDetailView.as_view(), name='report-detail'),
    path('analytics/', views.dashboard_analytics, name='dashboard-analytics'),
    path('transaction-summary/', views.transaction_summary_report, name='transaction-summary'),
    path('full-analytics/', views.full_analytics, name='full-analytics'),
]
