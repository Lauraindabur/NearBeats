from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse  
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.db.models import Q  # Nos deja usar OR |
from django.http import JsonResponse #Para usar AJAX y devolver JSON (temporal)
from library.models import Song, SongPlay
from django.db.models import F, Count
from .models import ArtistProfile  # Importa desde la app artist
from django.utils import timezone
from collections import Counter

# Create your views here.

def top_songs(request, artist_name):
    # Top canciones basadas en reproducciones reales (SongPlay)
    top = (
        SongPlay.objects
        .filter(song__artist_name=artist_name)
        .values('song__title')
        .annotate(play_count=Count('id'))
        .order_by('-play_count')[:5]
    )

    song_names = [row['song__title'] for row in top]
    play_counts = [row['play_count'] for row in top]

    return song_names, play_counts


@login_required
def artist_page(request, artist_name):
    if not (request.user.is_superuser or getattr(request.user, 'rol', None) == "Artista"):
        return HttpResponseForbidden("No tienes permiso para ver este perfil.")

    songs = Song.objects.filter(artist_name=artist_name)
    artist_profile = ArtistProfile.objects.filter(name=artist_name).first()
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    plays_this_month_qs = SongPlay.objects.filter(
        song__artist_name=artist_name, 
        played_at__gte=month_start
    )

    plays_this_month = plays_this_month_qs.count()

    # Nuevo: datos para gráfico de líneas por hora
    hours = [play.played_at.hour for play in plays_this_month_qs]
    hour_labels = [f"{h}:00" for h in range(24)]
    hour_data = [Counter(hours).get(h, 0) for h in range(24)]

    song_names, play_counts = top_songs(request, artist_name)

    return render(request, 'artist/profile.html', {
        'artist_name': artist_name,
        'artist_profile': artist_profile,
        'songs': songs,
        'plays_this_month': plays_this_month,
        'play_counts': play_counts,
        'song_names': song_names,
        # Datos para el segundo gráfico (reproducciones por hora)
        'hour_labels': hour_labels,
        'hour_data': hour_data,
    })
