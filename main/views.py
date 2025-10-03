from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse  
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.db.models import Q  # Nos deja usar OR |
from django.http import JsonResponse #Para usar AJAX y devolver JSON (temporal)
from library.models import Song, SongPlay, Like, Favorite
from artist.models import ArtistProfile
from django.db.models import F, Count
from django.utils import timezone
import random
from django.http import JsonResponse




def search_song__update_song_list(request):  #search_song y #update_song_list
    searchTerm = request.GET.get('q', '') 
    filterOption = request.GET.get('filtro', '')  
    #--> IMPT Aqui se implementa la logica del update_song_list
    if searchTerm:
        if filterOption == 'titulo':
            cancion = Song.objects.filter(title__icontains=searchTerm)  #cancion es un queryset del modelo Cancion (Base de datos)
        elif filterOption == 'artista':
            cancion = Song.objects.filter(artist_name__icontains=searchTerm)
        elif filterOption == 'emocion':
            cancion = Song.objects.filter(mood__icontains=searchTerm)
        elif filterOption == 'año_publicacion':
            cancion = Song.objects.filter(created_at__icontains=searchTerm)
        elif filterOption == 'genero':
            cancion = Song.objects.filter(genre__icontains=searchTerm)
        else:
            cancion = Song.objects.filter(
                Q(title__icontains=searchTerm) |
                Q(artist_name__icontains=searchTerm) |
                Q(genre__icontains=searchTerm) |
                Q(created_at__icontains=searchTerm) |
                Q(mood__icontains=searchTerm)
            )
    else:
        cancion = Song.objects.all()

    resultados_count = cancion.count()  #me dice cuantos resultados hay
    most_listened_artist=None
    artist_photo = None
    cant_reproductions = None
    #----Llamamos función que implementa aviso de artista más escuchado en ese filtro
    if (filterOption == 'emocion' or filterOption == 'año_publicacion' or filterOption == 'genero'):
        most_listened_artist , artist_photo, cant_reproductions = view_most_listened_category(cancion)

    return render(request, "main/base.html", {'canciones': cancion, 'searchTerm': searchTerm, 'filterOption': filterOption, 'resultados_count': resultados_count, 'most_listened_artist':most_listened_artist, 'artist_photo':artist_photo, 'cant_reproductions': cant_reproductions})  # Le pasamos el request y llamamos a la template base.html
 
def home(request):  #see_home_page
    return render(request, "main/home.html")  # Asegúrate de que el archivo home.html existe en la carpeta templates/main

def view_most_listened_category(resultados):
    most_listeners=0
    artist_photo = None
    song_most_listened=None
    plays_song=0
    for song in resultados:
        #Reproducciones de canción anterior
        aux = plays_song
        #Reproducciones de canción actual
        plays_song = get_plays_song(song)

        # if aux > plays_song:
        #     most_listeners=aux
        # else:
        #     most_listeners=plays_song
        #     #Porque indica que actual tiene más oyentes
        #     song_most_listened = song
        most_listeners = aux
        if aux < plays_song:
            song_most_listened = song
            most_listeners = plays_song
        
    if song_most_listened != None:
        artist = song_most_listened.artist_name
        # Obtenemos foto de perfil de ese artista
        artist_profile = ArtistProfile.objects.filter(name=artist).first()
        if artist_profile:
            artist_photo = artist_profile.profile_image
    else:
        artist = None
    return (artist,artist_photo, most_listeners)
        
        

#Obtenemos la cantidad de reproducciones de canción
def get_plays_song(song):
    plays_this_month_qs = SongPlay.objects.filter(song=song)
    plays_this_month = plays_this_month_qs.count()

    return plays_this_month


def display_random_song(request):
    emotion = request.GET.get("emotion")
    created_at = request.GET.get("created_at")
    genre = request.GET.get("genre")
    random_el = request.GET.get("random")

    usando_filtro = any([emotion, created_at, genre, random_el])
    songs = Song.objects.all()

    if(random_el):
        # Obtenemos dos elementos en posición aleatoria
        ids= list(Song.objects.values_list('id',flat=True))
        if len(ids) >= 2:
            random_ids =random.sample(ids,2)
            songs = Song.objects.filter(id__in=random_ids)
    else:
        if emotion:
            songs= songs.filter(mood__iexact=emotion)
        if created_at:
            songs = songs.filter(created_at=created_at)
        if genre:
            songs = songs.filter(genre__iexact=genre)
    
    #Retornamos el diccionario con los valores
    return render(request, 'main/home.html', {'songs': songs, 'usando_filtro': usando_filtro})


def suggested_songs_api(request):   #Api de devuelve 3 canciones aletorias para el navbar 
    try:
        ids = list(Song.objects.values_list('id', flat=True))
        if not ids:
            return JsonResponse({'songs': []})
        sample_ids = random.sample(ids, min(3, len(ids)))
        qs = Song.objects.filter(id__in=sample_ids)
        result = []
        for s in qs:
            result.append({
                'id': s.id,
                'title': s.title,
                'artist': s.artist_name,
                'cover': s.cover_image.url if s.cover_image else None,
            })
        return JsonResponse({'songs': result})
    except Exception:
        return JsonResponse({'songs': []})


def suggested_songs_context(request):
    try:
        ids = list(Song.objects.values_list('id', flat=True))
        if not ids:
            return {'suggested_songs': []}
        sample_ids = random.sample(ids, min(3, len(ids)))
        qs = Song.objects.filter(id__in=sample_ids)
        result = []
        for s in qs:
            result.append({
                'id': s.id,
                'title': s.title,
                'artist': s.artist_name,
                'cover': s.cover_image.url if s.cover_image else None,
            })
        return {'suggested_songs': result}
    except Exception:
        return {'suggested_songs': []}
