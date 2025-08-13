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
        # Obtenemos dos elementos en posición aleatoria
        ids= list(Song.object.values_list('id',flat=True))
        if len(ids) >= 2:
            random_ids =random.sample(ids,2)
            songs = Song.objects.filter(id_in=random_ids)
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
 