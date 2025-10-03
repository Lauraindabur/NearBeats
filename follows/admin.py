from django.contrib import admin

# Register your models here.
from .models import Follow, Notification
admin.site.register(Follow)
admin.site.register(Notification)
