from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView


urlpatterns = [
    path('register/', views.registrar_usuario, name='register'),
    path('login/', views.login_usuario, name='login'),
    path('logout/',views.logout_usuario, name='logout'),
]
