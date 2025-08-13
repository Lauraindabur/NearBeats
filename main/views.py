from django.shortcuts import render
from django.http import HttpResponse  
from .models import Song
from random import randint

# Create your views here.

def base(request):
    #return HttpResponse("<h1>Welcome to the Near Beats Project!</h1>")   
    return render(request, "main/base.html")  # Le pasamos el request y llamamos a la template base.html 
    
def home(request):
    return render(request, "main/home.html")  # Asegúrate de que el archivo home.html existe en la carpeta templates/main

def filtrar_sugerencias(request):

    emotion = request.GET.get("emocion")
    created_at = request.GET.get("created_at")
    genre = request.GET.get("genre")
    random = request.GET.get("random")

    songs = Song.objects.all()

    if(random):
        # Obtenemos elemento en posición aleatoria
        count = Song.objects.count()
        if ( count > 0):
            random_index = randint(0, count-1)
            songs=Song.objects.all()[random_index]

    else:
        if emotion:
            songs= songs.filter(mood=emotion)
        if created_at:
            songs = songs.filter(created_at=created_at)
        if genre:
            songs = songs.filter(genre=genre)
    
    #Retornamos el diccionario con los valores
    return render(request, 'main/home.html', {'songs': songs})
    # if (request.GET.get("random") == 1):
    #     pass
    # else:
    #     # Obtenemos parametros mandados en la URL: /home/?emocion=sad&created_at=2000&genre=pop
    #     emotion = request.GET.get("emocion")
    #     created_at = request.GET.get("created_at")
    #     genre = request.GET.get("genre")

    #     # Obtenemos todos los datos de la bd
    #     songs = Song.objects.filter(emotion, created_at, genre)