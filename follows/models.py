from django.db import models
from django.conf import settings
from artist.models import ArtistProfile

class Follow(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_follows')
    artist = models.ForeignKey(ArtistProfile, on_delete=models.CASCADE, related_name='artist_followers')
    followed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'artist')