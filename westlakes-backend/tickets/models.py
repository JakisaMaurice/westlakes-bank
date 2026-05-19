from django.db import models
from django.utils import timezone
from django.conf import settings


class Ticket(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='OPEN')
    admin_response = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ticket #{self.id} - {self.subject} ({self.status})"

    @property
    def is_open(self):
        return self.status == 'OPEN'

    @property
    def is_resolved(self):
        return self.status == 'RESOLVED'

    class Meta:
        ordering = ['-created_at']


class TicketReply(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ticket_replies')
    message = models.TextField()
    is_admin_reply = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        author_type = "Admin" if self.is_admin_reply else "Customer"
        return f"Reply by {author_type} on Ticket #{self.ticket.id}"

    class Meta:
        ordering = ['created_at']
