from django.shortcuts import render
from django.http import HttpResponse
from .models import Cancion
from django.db.models import Q  # Nos deja usar OR |
from django.http import JsonResponse

# Create your views here.

def home(request):
    searchTerm = request.GET.get('q', '')  #lo que el suario va a ingresar en la barra de busqueda
    filterOption = request.GET.get('filtro', '')  #opcion de filtro que el usuario selecciona si es que selecciona alguna
    if searchTerm:
        if filterOption == 'titulo':
          cancion = Cancion.objects.filter(titulo__icontains=searchTerm)
        elif filterOption == 'artista':
          cancion = Cancion.objects.filter(artista__icontains=searchTerm)
        elif filterOption == 'emocion':
          cancion = Cancion.objects.filter(emocion__icontains=searchTerm)
        elif filterOption == 'año_publicacion':
          cancion = Cancion.objects.filter(año_publicacion__icontains=searchTerm)
        elif filterOption == 'genero':
          cancion = Cancion.objects.filter(genero__icontains=searchTerm) 
        else:
            cancion = Cancion.objects.filter(
            Q(titulo__icontains=searchTerm) | Q(artista__icontains=searchTerm) | Q(genero__icontains=searchTerm) | Q(año_publicacion__icontains=searchTerm) | Q(emocion__icontains=searchTerm)
            )
    else:
        cancion = Cancion.objects.all()


    return render(request, 'home.html',{'canciones': cancion, 'searchTerm': searchTerm, 'filterOption': filterOption})

