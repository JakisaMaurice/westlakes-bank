from django.urls import path
from . import views

app_name = 'tickets'

urlpatterns = [
    path('', views.TicketListCreateView.as_view(), name='ticket-list-create'),
    path('<int:pk>/', views.TicketDetailView.as_view(), name='ticket-detail'),
    path('<int:ticket_id>/respond/', views.respond_to_ticket, name='respond-ticket'),
    path('<int:ticket_id>/close/', views.close_ticket, name='close-ticket'),
    path('<int:ticket_id>/reply/', views.TicketReplyView.as_view(), name='ticket-reply'),
]