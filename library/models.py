from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import os


# Create your models here.

class Song(models.Model):

    title = models.CharField(max_length=300)
    artist_name = models.CharField(max_length=100)
    genre = models.CharField(max_length=50)
    lyrics = models.TextField(blank=True)

    audio_file = models.FileField(upload_to="songs/audio/")
    cover_image = models.ImageField(
        upload_to="songs/covers/",
        blank=True,
        null=True
    )

    mood = models.CharField(
    max_length=50,
    choices=[
        ("feliz", "Feliz"),
        ("triste", "Triste"),
        ("energetico", "Energetico"),
        ("calmado", "Calmado"),
        ("romantico", "Romantico"),
        ("melancolico", "Melancolico"),
        ("enojado", "Enojado"),
        ("esperanzado", "Esperanzado"),
        ("nostalgico", "Nostalgico"),
        ("relajado", "Relajado"),
        ("oscuro", "Oscuro"),
        ("inspirador", "Inspirador"),
        ("epico", "Epico"),
        ("sonador", "Sonador"),
        ("solitario", "Solitario"),
        ("sensual", "Sensual"),
        ("seguro", "Seguro"),
        ("ruptura", "Ruptura"),
        ("sarcastico", "Sarcastico"),
        ("empoderado", "Empoderado"),
        ("rebelde", "Rebelde"),

     
    ],
    blank=True
)

    created_at = models.DateTimeField(auto_now_add=True)
    copyright = models.CharField(max_length=255, blank=True, null=True)

    def clean(self):
        """Validar que solo se suban archivos .mp3."""
        super().clean()
        if self.audio_file:
            ext = os.path.splitext(self.audio_file.name)[1]
            if ext.lower() != ".mp3":
                raise ValidationError(
                    {"audio_file": "Solo se permiten archivos .mp3"}
                )

    def __str__(self):
        return self.title



class Like(models.Model):
    """Modelo que representa un 'like' de un usuario a una canción."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="likes"  # Acceder a los likes de un usuario → user.likes.all()
    )
    song = models.ForeignKey(
        Song,
        on_delete=models.CASCADE,
        related_name="likes"  # Acceder a los likes de una canción → song.likes.all()
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "song")  # Un usuario no puede dar like dos veces

    def __str__(self):
        return f"{self.user} ❤️ {self.song.title}"
    
class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "song")  # Para evitar duplicados
