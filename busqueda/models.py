from django.db import models

# Create your models here.
class Cancion(models.Model):
    titulo = models.CharField(max_length=100)
    artista = models.CharField(max_length=100)
    genero = models.CharField(max_length=100)
    año_publicacion = models.IntegerField()
    emocion = models.CharField(max_length=100)

    def __str__(self):
            return self.titulo
