"""
URL configuration for nearbeats project.

The `urlpatterns` list routes URLs to views. For more information please see:
https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from main import views as mainViews  # Import views from main app

urlpatterns = [
    path('admin/', admin.site.urls),

    # Rutas de la app main
    path('', mainViews.home, name='home'),
    path('buscar/', mainViews.base, name='buscar'),
    path('filtrar/', mainViews.filtrar_sugerencias, name='filtrar_sugerencias'),
    path('library/', mainViews.library, name='library'),
    path('upload/', mainViews.upload_songs, name='upload_songs'),

    # Rutas de la app usuarios
    path('usuarios/', include('usuarios.urls')),  # Prefijo para diferenciar rutas de usuarios
]

# Configuración para archivos media
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
