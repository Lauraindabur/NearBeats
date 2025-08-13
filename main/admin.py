from django.contrib import admin
from .models import Song

# Register your models here.

#Para poder garantizar quee el modelo se incluya en la interfaz de administración
admin.site.register(Song)
