from django.contrib import admin

from django.contrib import admin
from library.models import Song
# Register your models here.
admin.site.register(Song)  # Register the Song model to make it available in the admin interface
