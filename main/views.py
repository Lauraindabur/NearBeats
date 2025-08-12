from django.shortcuts import render
from django.http import HttpResponse
from django.db.models import Q  # Nos deja usar OR |
from django.http import JsonResponse

from main.models import Song    

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
