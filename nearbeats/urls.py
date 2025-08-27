"""
URL configuration for nearbeats project.
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
    path("toggle-like/<int:song_id>/", mainViews.toggle_like, name="toggle_like"),
    # Rutas de la app usuarios (prefijo para no chocar con main)
    path('usuarios/', include('usuarios.urls')),
     path("toggle-favorite/<int:song_id>/", mainViews.toggle_favorite, name="toggle_favorite"),
    path("favorites/", mainViews.favorites_list, name="favorites"),
]

# Archivos media
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
from django.urls import path

