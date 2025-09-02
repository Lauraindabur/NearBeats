from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse  
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.db.models import Q  # Nos deja usar OR |
from django.http import JsonResponse #Para usar AJAX y devolver JSON (temporal)
from library.models import Song, Like, Favorite
from django.db.models import F, Count
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
    else:
        for song in songs:
            song.is_liked = False
            song.is_favorited = False

    return render(request, 'library.html', {'songs': songs})



def upload_songs(request):
    if not request.user.is_authenticated:
        return redirect('login')  # Redirige al login si no ha iniciado sesión

    if request.user.rol != "Artista":
        return HttpResponseForbidden("No tienes permiso para subir canciones")  
        # O también podrías hacer: return redirect('home')

    if request.method == 'POST':
        title = request.POST.get('title')
        artist_name = request.POST.get('artist_name')
        genre = request.POST.get('genre')
        lyrics = request.POST.get('lyrics')
        mood = request.POST.get('mood')
        copyright_text = request.POST.get('copyright')
        audio_file = request.FILES.get('audio_file')
        cover_image = request.FILES.get('cover_image')

        song = Song(
            title=title,
            artist_name=artist_name,
            genre=genre,
            lyrics=lyrics,
            mood=mood,
            copyright=copyright_text,
            audio_file=audio_file,
            cover_image=cover_image
        )
        song.full_clean()
        song.save()

        return redirect('library')

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



