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
    return render(request, "main/base.html", {'canciones': cancion, 'searchTerm': searchTerm, 'filterOption': filterOption, 'resultados_count': resultados_count})  # Le pasamos el request y llamamos a la template base.html
 
def home(request):  #see_home_page
    return render(request, "main/home.html")  # Asegúrate de que el archivo home.html existe en la carpeta templates/main

def filtrar_sugerencias(request):  #display_random_song
    emotion = request.GET.get("emotion", "").strip().lower()
    created_at = request.GET.get("created_at", "").strip()
    genre = request.GET.get("genre", "").strip()
    random_el = request.GET.get("random")

    songs = Song.objects.all()
    

    if random_el:
        # Obtenemos dos elementos en posición aleatoria
        ids = list(Song.objects.values_list('id', flat=True))
        if len(ids) >= 2:
            random_ids = random.sample(ids, 2)
            songs = Song.objects.filter(id__in=random_ids)
    else:
        if emotion:
            # Filtramos por mood en español, insensible a mayúsculas
            songs = songs.filter(mood__iexact=emotion.strip())
        if created_at:
            songs = songs.filter(created_at__icontains=created_at)
        if genre:
            songs = songs.filter(genre__icontains=genre)

    # Retornamos el diccionario con los valores
    return render(request, 'main/home.html', {'songs': songs})