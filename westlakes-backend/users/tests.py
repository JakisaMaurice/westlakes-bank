from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse


class AdminRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('users:admin-register')

    @override_settings(ADMIN_REGISTRATION_CODE='super-secret-admin-code')
    def test_admin_registration_with_valid_code_creates_admin(self):
        payload = {
            'full_name': 'Admin User',
            'email': 'new-admin@westlakes.bank',
            'phone_number': '+1234567890',
            'national_id': 'ID123456',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
            'admin_code': 'super-secret-admin-code',
        }
        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['role'], 'ADMIN')
        self.assertTrue(response.data['user']['is_verified'])
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

    @override_settings(ADMIN_REGISTRATION_CODE='super-secret-admin-code')
    def test_admin_registration_with_invalid_code_is_rejected(self):
        payload = {
            'full_name': 'Admin User',
            'email': 'new-admin@westlakes.bank',
            'phone_number': '+1234567890',
            'national_id': 'ID123456',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
            'admin_code': 'wrong-code',
        }
        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('admin_code', response.data)
