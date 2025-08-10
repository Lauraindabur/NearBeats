from django.shortcuts import render
from .models import Song

def library(request):
    songs = Song.objects.all()
    return render(request, 'library.html', {'songs': songs})
