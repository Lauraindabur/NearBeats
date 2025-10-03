from django.db import models
from django.conf import settings
from artist.models import ArtistProfile

class Follow(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_follows')
    artist = models.ForeignKey(ArtistProfile, on_delete=models.CASCADE, related_name='artist_followers')
    followed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'artist')

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    artist_name = models.CharField(max_length=200)
    message = models.CharField(max_length=255)
    data = models.JSONField(null=True, blank=True)  
    deliver_at = models.DateTimeField(null=True, blank=True)
    sent = models.BooleanField(default=False)   # marcado cuando ya se entregó/mostró
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'sent', 'deliver_at']),
        ]

    def __str__(self):
        return f"Notif to {self.user} from {self.artist_name}: {self.message}"