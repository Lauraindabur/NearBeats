from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse  
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.db.models import Q  # Nos deja usar OR |
from django.http import JsonResponse #Para usar AJAX y devolver JSON (temporal)
from .models import Song, Like, Favorite
from django.db.models import F, Count
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

    return render(request, 'main/library.html', {'songs': songs})



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

    return render(request, 'main/upload_songs.html', {
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
    favorites = Favorite.objects.filter(user=request.user).select_related("song")
    songs = [fav.song for fav in favorites]
    return render(request, "main/favorites.html", {"songs": songs})

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



