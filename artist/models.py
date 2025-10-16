from django.db import models


# Create your models here.


class ArtistProfile(models.Model):  #se pone el mismo nombre que el definido en class Song --artist_name--
    name = models.CharField(max_length=100, unique=True)
    bio = models.TextField(blank=True, default="Proyecto musical que busca conectar con las emociones y experiencias de la vida a través de sonidos auténticos y letras sinceras. Con un estilo que mezcla influencias de distintos géneros, su propuesta refleja una identidad versátil y en constante evolución")
    profile_image = models.ImageField(
        upload_to="artists/profiles/",
        blank=True,
        null=True,
        default='artists/profiles/artist_foto.jpg'
    )

    def __str__(self):
        return self.name
    
class Events(models.Model):
    artist = models.ManyToManyField(
        ArtistProfile,
        related_name='eventos'
    )
    title = models.CharField(max_length=100)
    description = models.CharField(null=True, blank=True)
    date = models.DateTimeField()
    tickets = models.CharField(max_length=150, default="www.tickets.com") 
    event_poster = models.ImageField(upload_to='artists/events/', null=True, blank=True, default='artists/events/poster_default.jpg')