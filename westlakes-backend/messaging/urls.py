from django.urls import path
from . import views

app_name = 'messaging'

urlpatterns = [
    path('', views.MessageListCreateView.as_view(), name='message-list-create'),
    path('<int:pk>/', views.MessageDetailView.as_view(), name='message-detail'),
    path('<int:message_id>/read/', views.mark_message_read, name='mark-message-read'),
]
