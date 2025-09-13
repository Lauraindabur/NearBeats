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

#Función para inicializar todos las funciones cuando se acceda a la pagina desde
#cualquier url
def get_artist_dashboard(request, artist_name):
    context={}
    context.update(see_top_songs(request, artist_name))
    context.update(see_artist_graphic(request, artist_name))
    context.update(view_song_selected_artist(request, artist_name))

    #Normalizar datos aquí antes de pasarlos al template
    # if "play_counts" in context:
    #     context["play_counts"] = [int(v) for v in context["play_counts"]]
    # if "hour_data" in context:
    #     context["hour_data"] = [int(v) for v in context["hour_data"]]


    return render(request,'artist/profile.html', context)

def see_top_songs(request, artist_name):  #see_top_songs
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

    return {'song_names':song_names, 'play_counts':play_counts,}


#@login_required
def see_artist_graphic(request, artist_name):   #see_artist_graphic
    if getattr(request.user, 'rol', None) == "Oyente" and artist_name == request.user.nombre:
        return HttpResponseForbidden("No tienes permiso para ver este perfil.")


    songs = Song.objects.filter(artist_name=artist_name)
    artist_profile = ArtistProfile.objects.filter(name=artist_name).first()
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    #------> here display_listeners_count
    plays_this_month_qs = SongPlay.objects.filter(
        song__artist_name=artist_name, 
        played_at__gte=month_start
    )

    plays_this_month = plays_this_month_qs.count()

    # Nuevo: datos para gráfico de líneas por hora
    hours = [play.played_at.hour for play in plays_this_month_qs]
    hour_labels = [f"{h}:00" for h in range(24)]
    hour_data = [Counter(hours).get(h, 0) for h in range(24)]

    #song_names, play_counts = see_top_songs(request, artist_name)
    top_songs_data = see_top_songs(request, artist_name)

    return {
        'artist_name': artist_name,
        'artist_profile': artist_profile,
        'songs': songs,
        'plays_this_month': plays_this_month,
        **top_songs_data,  # Desempaqueta el diccionario
        'hour_labels': hour_labels,
        'hour_data': hour_data,
    }

def view_song_selected_artist(request, artist_name): #artist_name lo pasamo en la url
    #Obtenemos las canciones de ese artista
    songList = Song.objects.filter(artist_name=artist_name)
    return {'songList':songList}
