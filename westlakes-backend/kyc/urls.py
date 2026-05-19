from django.urls import path
from . import views

app_name = 'kyc'

urlpatterns = [
    path('my-kyc/', views.MyKYCStatusView.as_view(), name='my-kyc'),
    path('upload-document/', views.UploadDocumentView.as_view(), name='upload-document'),
    path('submit/', views.SubmitKYCView.as_view(), name='submit-kyc'),
    path('documents/<int:pk>/', views.DeleteDocumentView.as_view(), name='delete-document'),
    path('admin/verifications/', views.AdminKYCListView.as_view(), name='admin-kyc-list'),
    path('admin/verifications/<int:pk>/', views.AdminKYCDetailView.as_view(), name='admin-kyc-detail'),
    path('admin/verifications/<int:pk>/approve/', views.AdminApproveKYCView.as_view(), name='admin-approve-kyc'),
    path('admin/verifications/<int:pk>/reject/', views.AdminRejectKYCView.as_view(), name='admin-reject-kyc'),
    path('admin/verifications/<int:pk>/request-changes/', views.AdminRequestChangesKYCView.as_view(), name='admin-request-changes'),
]
