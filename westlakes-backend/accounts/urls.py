from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('', views.BankAccountListCreateView.as_view(), name='account-list-create'),
    path('<int:pk>/', views.BankAccountDetailView.as_view(), name='account-detail'),
    path('<int:account_id>/approve/', views.approve_account, name='approve-account'),
    path('<int:account_id>/reject/', views.reject_account, name='reject-account'),
    path('<int:account_id>/suspend/', views.suspend_account, name='suspend-account'),
    path('<int:account_id>/activate/', views.activate_account, name='activate-account'),
    path('<int:account_id>/freeze/', views.freeze_account, name='freeze-account'),
    path('<int:account_id>/lock/', views.lock_account, name='lock-account'),
    path('<int:account_id>/unlock/', views.unlock_account, name='unlock-account'),
    path('atm-cards/', views.atm_card_list, name='atm-card-list'),
    path('<int:account_id>/atm-card/issue/', views.issue_atm_card, name='issue-atm-card'),
    path('<int:account_id>/atm-card/block/', views.block_atm_card, name='block-atm-card'),
    path('<int:account_id>/atm-card/unblock/', views.unblock_atm_card, name='unblock-atm-card'),
    path('<int:account_id>/atm-card/set-pin/', views.set_card_pin, name='set-card-pin'),
    path('my-cards/', views.my_cards, name='my-cards'),
]
