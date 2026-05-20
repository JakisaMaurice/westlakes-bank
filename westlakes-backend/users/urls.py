from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('register/admin/', views.AdminRegistrationView.as_view(), name='admin-register'),
    path('login/', views.user_login, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('set-pin/', views.set_transaction_pin, name='set-pin'),
    path('verify-pin/', views.verify_transaction_pin, name='verify-pin'),
    path('customers/', views.CustomerListView.as_view(), name='customer-list'),
    path('customers/<int:pk>/', views.CustomerDetailView.as_view(), name='customer-detail'),
    path('customers/<int:customer_id>/verify/', views.verify_customer, name='verify-customer'),
    path('customers/<int:customer_id>/reset-password/', views.admin_reset_password, name='admin-reset-password'),
    path('messaging/admin/', views.get_admin_for_messaging, name='get-admin-messaging'),
]
