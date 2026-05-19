from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Ticket
from .serializers import TicketSerializer, TicketCreateSerializer, TicketUpdateSerializer, TicketReplyCreateSerializer
from users.permissions import IsCustomer, IsAdmin, IsSupport


class TicketListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.role == 'SUPPORT':
            return Ticket.objects.all()
        return Ticket.objects.filter(customer=user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketSerializer


class TicketDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    queryset = Ticket.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.role == 'SUPPORT':
            return Ticket.objects.all()
        return Ticket.objects.filter(customer=user)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TicketUpdateSerializer
        return TicketSerializer

    def update(self, request, *args, **kwargs):
        # Only admins/support can update status and admin_response
        user = request.user
        if not (user.is_admin or user.role == 'SUPPORT'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([IsSupport])
def respond_to_ticket(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id)
    response_text = request.data.get('response', '')

    if not response_text:
        return Response({'error': 'Response text is required'}, status=status.HTTP_400_BAD_REQUEST)

    ticket.admin_response = response_text
    ticket.status = 'IN_PROGRESS'
    ticket.save()

    serializer = TicketSerializer(ticket)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsSupport])
def close_ticket(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id)

    if ticket.status == 'CLOSED':
        return Response({'error': 'Ticket is already closed'}, status=status.HTTP_400_BAD_REQUEST)

    ticket.status = 'CLOSED'
    ticket.save()

    serializer = TicketSerializer(ticket)
    return Response(serializer.data)


class TicketReplyView(generics.CreateAPIView):
    serializer_class = TicketReplyCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, ticket_id):
        ticket = get_object_or_404(Ticket, id=ticket_id)

        if ticket.status == 'CLOSED':
            return Response({'error': 'Cannot reply to a closed ticket.'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user != ticket.customer and not (request.user.is_admin or request.user.role == 'SUPPORT'):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        is_admin = request.user.is_admin or request.user.role == 'SUPPORT'
        reply = serializer.save(
            ticket=ticket,
            author=request.user,
            is_admin_reply=is_admin
        )

        if is_admin:
            ticket.status = 'IN_PROGRESS'
        else:
            ticket.status = 'OPEN'
        ticket.save()

        from .serializers import TicketReplySerializer
        return Response(TicketReplySerializer(reply).data, status=status.HTTP_201_CREATED)
