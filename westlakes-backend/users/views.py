from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import User
from .serializers import (
    UserSerializer, UserRegistrationSerializer, AdminRegistrationSerializer,
    UserLoginSerializer, UserProfileUpdateSerializer, CustomerAdminSerializer
)
from .permissions import IsCustomer, IsAdmin
from audit_logs.models import AuditLog


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response_data = {
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': access_token,
            },
            'message': 'User registered successfully. Account is pending approval.'
        }

        return Response(response_data, status=status.HTTP_201_CREATED)


class AdminRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response_data = {
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': access_token,
            },
            'message': 'Admin account created successfully.'
        }

        return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': access_token,
            },
            'message': 'Login successful'
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserSerializer


class CustomerListView(generics.ListAPIView):
    serializer_class = CustomerAdminSerializer
    permission_classes = [IsAdmin]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = User.objects.filter(role='CUSTOMER').prefetch_related('accounts')

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(national_id__icontains=search) |
                Q(accounts__account_number__icontains=search)
            ).distinct()

        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(accounts__status=status_param.upper()).distinct()

        account_type = self.request.query_params.get('account_type')
        if account_type:
            queryset = queryset.filter(accounts__account_type=account_type.upper()).distinct()

        is_verified = self.request.query_params.get('is_verified')
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')

        ordering = self.request.query_params.get('ordering', '-created_at')
        allowed_ordering = ['created_at', '-created_at', 'full_name', '-full_name', 'email', '-email']
        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)

        return queryset


class CustomerDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomerAdminSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.filter(role='CUSTOMER').prefetch_related('accounts')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CustomerAdminSerializer
        return CustomerAdminSerializer


@api_view(['POST'])
@permission_classes([IsAdmin])
def verify_customer(request, customer_id):
    user = User.objects.filter(id=customer_id, role='CUSTOMER').first()
    if not user:
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

    previous = {'is_verified': user.is_verified}
    user.is_verified = True
    user.save()
    new = {'is_verified': user.is_verified}

    AuditLog.objects.create(
        admin=request.user,
        customer=user,
        action='CUSTOMER_VERIFIED',
        previous_value=previous,
        new_value=new,
    )

    return Response(CustomerAdminSerializer(user).data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def admin_reset_password(request, customer_id):
    user = User.objects.filter(id=customer_id, role='CUSTOMER').first()
    if not user:
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

    new_password = request.data.get('new_password')
    if not new_password or len(new_password) < 8:
        return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    AuditLog.objects.create(
        admin=request.user,
        customer=user,
        action='PASSWORD_RESET',
        notes='Password reset by admin',
    )

    return Response({'message': 'Password reset successfully'})
