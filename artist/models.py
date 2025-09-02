from django.db import models


# Create your models here.


class ArtistProfile(models.Model):  #se debe tener el mismo nombre que el definido en class Song --artist_name--
    name = models.CharField(max_length=100, unique=True)
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to="artists/profiles/", blank=True, null=True)

    def __str__(self):
        return self.name