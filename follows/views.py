from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from artist.models import ArtistProfile
from .models import Follow

@require_POST
@login_required
def ajax_toggle_follow(request):
    artist_name = request.POST.get('artist_name')
    artist = ArtistProfile.objects.get(name=artist_name)
    follow, created = Follow.objects.get_or_create(user=request.user, artist=artist)
    if not created:
        follow.delete()
        is_followed = False
    else:
        is_followed = True
    followers_count = artist.artist_followers.count()
    return JsonResponse({'is_followed': is_followed, 'followers_count': followers_count})


def view_artist_followers(request):  #view_artist_followers
    artist_name = request.GET.get('artist_name')
    artist = ArtistProfile.objects.get(name=artist_name)
    followers_count = artist.artist_followers.count()
    return JsonResponse({'followers_count': followers_count})