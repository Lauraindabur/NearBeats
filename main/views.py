from django.shortcuts import render
from django.http import HttpResponse  
from django.db.models import Q  # Nos deja usar OR |
from django.http import JsonResponse #Para usar AJAX y devolver JSON (temporal)
from .models import Song
import random

# Create your views here.

def base(request):
    searchTerm = request.GET.get('q', '')  #lo que el suario va a ingresar en la barra de busqueda
    filterOption = request.GET.get('filtro', '')  #opcion de filtro que el usuario selecciona si es que selecciona alguna
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

def home(request):
    return render(request, "main/home.html")  # Asegúrate de que el archivo home.html existe en la carpeta templates/main

def filtrar_sugerencias(request):

    emotion = request.GET.get("emotion")
    created_at = request.GET.get("created_at")
    genre = request.GET.get("genre")
    random_el = request.GET.get("random")

    
    songs = Song.objects.all()

    if(random_el):
        # Obtenemos dos elementos en posición aleatoria
        ids= list(Song.objects.values_list('id',flat=True))
        if len(ids) >= 2:
            random_ids =random.sample(ids,2)
            songs = Song.objects.filter(id__in=random_ids)
        # count = Song.objects.count()
        # if ( count > 0):
        #     random_index = randint(0, count-1)
        #     songs=Song.objects.all()[random_index]
    else:
        if emotion:
            songs= songs.filter(mood=emotion)
        if created_at:
            songs = songs.filter(created_at=created_at)
        if genre:
            songs = songs.filter(genre=genre)

    #Retornamos el diccionario con los valores
    return render(request, 'main/home.html', {'songs': songs})