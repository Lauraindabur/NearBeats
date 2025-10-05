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
    path('buscar/', mainViews.search_song__update_song_list, name='buscar'),   #Dentro de el implementamos RF update_song_list
    path('buscar/suggested/', mainViews.suggested_songs_api, name='buscar_suggested'),
    path('filtrar/', mainViews.display_random_song, name='display_random_song'),
    path('buscar/suggested/', mainViews.suggested_songs_api, name='buscar_suggested'),
    
    # Rutas de la app library
    path('library/', libraryViews.see_library, name='see_library'),
    path('upload/', libraryViews.upload_songs, name='upload_songs'),
    path("toggle-like/<int:song_id>/", libraryViews.like_song, name="like_song"),
    path("save-favorite/<int:song_id>/", libraryViews.save_favorite, name="save_favorite"),
    path("favorites/", libraryViews.see_favorites_list, name="favorites"),
    path('play/<int:song_id>/', libraryViews.play_song, name='play_song'),


    path('playlists/', libraryViews.playlists, name='playlists'),
    path('playlists/create/', libraryViews.create_playlist, name='create_playlist'),
    path('playlists/<int:playlist_id>/', libraryViews.playlist_detail, name='playlist_detail'),
    path('playlists/<int:playlist_id>/add-song/', libraryViews.add_song_to_playlist, name='add_song_to_playlist'),
    path('playlists/<int:playlist_id>/remove-song/<int:song_id>/', libraryViews.remove_song_from_playlist, name='remove_song_from_playlist'),
    path('playlists/<int:playlist_id>/delete/', libraryViews.delete_playlist, name='delete_playlist'),

    # Rutas de la app usuarios (prefijo para no chocar con main)
    path('usuarios/', include('usuarios.urls')),

    # Rutas de la app artist
    path('artist/', include('artist.urls')),

    # Rutas de la app follows
    path('follows/', include('follows.urls')),
]

# Archivos media
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)