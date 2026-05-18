from django.conf import settings
from django.core.mail import EmailMessage
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class ContactMessageSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=40, required=False, allow_blank=True)
    message = serializers.CharField(max_length=5000)


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_message(request):
    serializer = ContactMessageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    if not settings.EMAIL_HOST:
        return Response(
            {
                'detail': 'SMTP is not configured. Set EMAIL_HOST and related email environment variables.'
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    phone_number = data.get('phone_number') or 'Not provided'
    subject = f"Westlakes Bank contact form: {data['full_name']}"
    body = (
        f"Name: {data['full_name']}\n"
        f"Email: {data['email']}\n"
        f"Phone: {phone_number}\n\n"
        f"Message:\n{data['message']}"
    )

    try:
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[settings.CONTACT_RECIPIENT_EMAIL],
            reply_to=[data['email']],
        )
        email.send(fail_silently=False)
    except Exception:
        return Response(
            {'detail': 'Unable to send contact email with the configured SMTP settings.'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(
        {'message': 'Contact message sent successfully.'},
        status=status.HTTP_200_OK,
    )
