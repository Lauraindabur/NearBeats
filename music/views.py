from django.shortcuts import render, redirect
from .models import Song

def library(request):
    songs = Song.objects.all()
    return render(request, 'library.html', {'songs': songs})


def upload_songs(request):
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

    # Aquí pasamos todos los moods definidos en el modelo
    return render(request, 'upload_songs.html', {
        'moods': Song._meta.get_field('mood').choices
    })
