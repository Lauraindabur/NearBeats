"""
URL configuration for nearbeats project.
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from main import views as mainViews  # Import views from main app
from library import views as libraryViews

urlpatterns = [
    path('admin/', admin.site.urls),

    # Rutas de la app main
    path('', mainViews.home, name='home'),
    path('buscar/', mainViews.base, name='buscar'),
    path('filtrar/', mainViews.filtrar_sugerencias, name='filtrar_sugerencias'),

    # Rutas de la app library
    path('library/', libraryViews.see_library, name='see_library'),
    path('upload/', libraryViews.upload_songs, name='upload_songs'),
    path("toggle-like/<int:song_id>/", libraryViews.like_song, name="like_song"),
    path("toggle-favorite/<int:song_id>/", libraryViews.save_favorite, name="save_favorite"),
    path("favorites/", libraryViews.see_favorites_list, name="favorites"),
    path('play/<int:song_id>/', libraryViews.play_song, name='play_song'),

    # Rutas de la app usuarios (prefijo para no chocar con main)
    path('usuarios/', include('usuarios.urls')),

    # Rutas de la app artist
    path('artist/', include('artist.urls')),

    # Rutas de la app follows
    path('follows/', include('follows.urls')),
]

# Archivos media
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

