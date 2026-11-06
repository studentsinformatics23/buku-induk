from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/', views.login_view, name='auth-login'),
    path('logout/', views.logout_view, name='auth-logout'),
    path('me/', views.me_view, name='auth-me'),
    path('register/', views.register_view, name='auth-register'),
    path('users/', views.user_list_create_view, name='auth-users-list-create'),
    path('users/<int:user_id>/', views.user_detail_update_delete_view, name='auth-user-detail-update-delete'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('change-password/', views.change_password_view, name='auth-change-password'),
]
