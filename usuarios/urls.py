from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView


urlpatterns = [
    path('register/', views.create_user_account, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/',views.logout_user, name='logout'),
]
