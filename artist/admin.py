from django.contrib import admin
from .models import ArtistProfile, Events
# Register your models here.
admin.site.register(ArtistProfile)
admin.site.register(Events)