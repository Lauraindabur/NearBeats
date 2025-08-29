from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse  
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.db.models import Q  # Nos deja usar OR |
from django.http import JsonResponse #Para usar AJAX y devolver JSON (temporal)
from main.models import Song, SongPlay
from django.db.models import F, Count
from .models import ArtistProfile  # Importa desde la app artist
from django.utils import timezone


# Create your views here.

def artist_page(request, artist_name):
    songs = Song.objects.filter(artist_name=artist_name)
    artist_profile = ArtistProfile.objects.filter(name=artist_name).first()
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    plays_this_month = SongPlay.objects.filter(
        song__artist_name=artist_name, 
        played_at__gte=month_start
        ).count()

    return render(request, 'artist/profile.html', {
        'artist_name': artist_name,
        'artist_profile': artist_profile,
        'songs': songs,
        'plays_this_month': plays_this_month,
    })