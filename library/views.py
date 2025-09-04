from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse  
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.db.models import Q  # Nos deja usar OR |
from django.http import JsonResponse #Para usar AJAX y devolver JSON (temporal)
from library.models import Song, Like, Favorite, SongPlay
from django.db.models import F, Count
from follows.models import Follow
from artist.models import ArtistProfile
import io, os
import zipfile
import tempfile
import pandas as pd
from django.contrib import messages
from django.utils import timezone
import random


# Create your views here.
def library(request):
    songs = Song.objects.annotate(likes_count=Count("likes"))

    if request.user.is_authenticated:
        user_likes = set(
            Like.objects.filter(user=request.user).values_list("song_id", flat=True)
        )
        user_favorites = set(
            Favorite.objects.filter(user=request.user).values_list("song_id", flat=True)
        )
        for song in songs:
            song.is_liked = song.id in user_likes
            song.is_favorited = song.id in user_favorites
            try:
                artist = ArtistProfile.objects.get(name=song.artist_name)
                song.is_followed = Follow.objects.filter(user=request.user, artist=artist).exists()
            except ArtistProfile.DoesNotExist:
                song.is_followed = False
    else:
        for song in songs:
            song.is_liked = False
            song.is_favorited = False

    return render(request, 'library.html', {'songs': songs})


def upload_songs(request):
    if not request.user.is_authenticated:
        return redirect('login')

    if request.user.rol != "Artista":
        return HttpResponseForbidden("No tienes permiso para subir canciones")

    # Segundo POST: guardar canciones con moods individuales
    if request.method == 'POST' and any(k.startswith('mood_') for k in request.POST.keys()):
        songs_list = request.session.get('songs_list', [])
        zip_path = request.session.get('songs_zip_path')
        copyright_text = request.session.get('copyright_text', '')

        if not songs_list or not zip_path:
            messages.error(request, "No se encontró la información de la sesión. Intenta subir el Excel y ZIP nuevamente.")
            return redirect('upload_songs')

        # Abrir ZIP desde archivo temporal
        with zipfile.ZipFile(zip_path) as z:
            zip_files = {name: z.read(name) for name in z.namelist()}

        for i, song_data in enumerate(songs_list, start=1):
            title = song_data.get('title', '').strip()
            genre = song_data.get('genre', '').strip()
            lyrics = song_data.get('lyrics', '').strip()
            audio_file = song_data.get('audiofile', '').strip() 
            cover_image = song_data.get('coverimage', '').strip()

            mood = request.POST.get(f'mood_{i}', 'default')

            song = Song(
                title=title,
                artist_name=request.user.nombre,
                genre=genre,
                lyrics=lyrics,
                mood=mood,
                copyright=copyright_text
            )

            # Adjuntar audio 
            found_audio = None
            audio_file_name = os.path.basename(audio_file).lower()
            for path in zip_files.keys():
                if os.path.basename(path).lower() == audio_file_name:
                    found_audio = path
                    break

            if found_audio:
                song.audio_file.save(os.path.basename(found_audio), io.BytesIO(zip_files[found_audio]), save=False)
            else:
                messages.warning(request, f"No se encontró el audio '{audio_file}' en el ZIP.")

            # Adjuntar portada 
            found_cover = None
            cover_file_name = os.path.basename(cover_image).lower()
            for path in zip_files.keys():
                if os.path.basename(path).lower() == cover_file_name:
                    found_cover = path
                    break

            if found_cover:
                song.cover_image.save(os.path.basename(found_cover), io.BytesIO(zip_files[found_cover]), save=False)
            else:
                messages.warning(request, f"No se encontró la portada '{cover_image}' en el ZIP.")

            #Guardar solo si tiene audio
            if song.audio_file:
                song.save()
            else:
                messages.error(request, f"La canción '{title}' no se guardó porque no tiene archivo de audio.")

        # Limpiar sesión
        request.session.pop('songs_list', None)
        request.session.pop('songs_zip_path', None)
        request.session.pop('copyright_text', None)

        # Borrar archivo temporal
        if os.path.exists(zip_path):
            os.remove(zip_path)

        messages.success(request, "✅ Canciones procesadas correctamente.")
        return redirect('library')

    # Primer POST: subir Excel + ZIP
    if request.method == 'POST' and "songs_excel" in request.FILES and "songs_zip" in request.FILES:
        songs_excel = request.FILES["songs_excel"]
        songs_zip = request.FILES["songs_zip"]
        copyright_text = request.POST.get('copyright', '')

        # Leer Excel
        df = pd.read_excel(songs_excel)
        songs_list = df.to_dict('records')  # Lista de diccionarios

        # Guardar ZIP en archivo temporal
        tmp = tempfile.NamedTemporaryFile(delete=False)
        tmp.write(songs_zip.read())
        tmp_path = tmp.name
        tmp.close()

        # Guardar en sesión solo la ruta y datos simples
        request.session['songs_list'] = songs_list
        request.session['songs_zip_path'] = tmp_path
        request.session['copyright_text'] = copyright_text

        # Renderizar formulario de selección de moods por canción
        return render(request, 'upload_songs.html', {
            'songs_list': songs_list,
            'moods': Song._meta.get_field('mood').choices,
        })

    # Subida individual 
    return render(request, 'upload_songs.html', {
        'moods': Song._meta.get_field('mood').choices
    })





@login_required
def toggle_like(request, song_id):
    song = get_object_or_404(Song, id=song_id)

    like, created = Like.objects.get_or_create(user=request.user, song=song)

    if not created:
        like.delete()
        liked = False
    else:
        liked = True

    likes_count = Like.objects.filter(song=song).count()

    return JsonResponse({"liked": liked, "likes_count": likes_count})

@login_required
def favorites_list(request):
    # Tus favoritos
    favorites = Favorite.objects.filter(user=request.user).select_related("song")
    songs = [fav.song for fav in favorites]

    # Enriquecer canciones con info de likes y favoritos
    for song in songs:
        song.likes_count = Like.objects.filter(song=song).count()
        song.is_liked = Like.objects.filter(song=song, user=request.user).exists()
        song.is_favorited = True  # Siempre verdadero en favoritos

    # Canciones que no están en favoritos para recomendación
    all_songs = Song.objects.exclude(id__in=[song.id for song in songs])
    recommended_song = None
    if all_songs.exists():
        recommended_song = random.choice(all_songs)

    return render(request, "favorites.html", {
        "songs": songs,
        "recommended_song": recommended_song
    })


@login_required
def toggle_favorite(request, song_id):
    if request.method == "POST":
        song = get_object_or_404(Song, id=song_id)
        user = request.user

        favorite, created = Favorite.objects.get_or_create(user=user, song=song)

        if not created:
            favorite.delete()
            is_favorited = False
        else:
            is_favorited = True

        return JsonResponse({"is_favorited": is_favorited})

    return JsonResponse({"error": "Método no permitido"}, status=405)



@login_required
def play_song(request, song_id):
    song = get_object_or_404(Song, id=song_id)  #busca la cancion con el id de la cancion que se reproduce
    SongPlay.objects.create(     #crea un registro en SongPlay con el usuario
        user=request.user,    #guarda el nombre del usuario
        song=song)   #guarda la cancion que se reproduce
    return JsonResponse({'status': 'ok'})   #para revisar en network si se recibe la peticion