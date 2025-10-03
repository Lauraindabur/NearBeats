from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from artist.models import ArtistProfile
from .models import Follow, Notification
from django.utils import timezone

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

@login_required
def notifications_unread(request):
    # Defensive: if not authenticated, return empty list to avoid anonymous user errors
    if not request.user.is_authenticated:
        return JsonResponse({'notifications': []})

    now = timezone.now()
    qs = Notification.objects.filter(user=request.user, sent=False, deliver_at__lte=now).order_by('created_at')
    items = [{
        'id': n.id,
        'artist_name': n.artist_name,
        'message': n.message,
        'data': n.data,
        'created_at': n.created_at.isoformat(),
    } for n in qs]
    return JsonResponse({'notifications': items})

@login_required
def notifications_mark_read(request):
    if request.method != 'POST':
        return HttpResponseBadRequest()
    ids = request.POST.getlist('ids[]') or request.POST.getlist('ids')
    if ids:
        Notification.objects.filter(id__in=ids, user=request.user).update(sent=True)
    return JsonResponse({'ok': True})