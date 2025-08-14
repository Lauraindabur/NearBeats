from django.db import models

# Create your models here.

from django.db import models
from django.contrib.auth.models import User


from django.core.exceptions import ValidationError
import os

class Song(models.Model):
    title = models.CharField(max_length=300)
    artist_name = models.CharField(max_length=100)
    genre = models.CharField(max_length=50)
    lyrics = models.TextField(blank=True)
    audio_file = models.FileField(upload_to='songs/audio/')
    cover_image = models.ImageField(upload_to='songs/covers/', blank=True, null=True)
    mood = models.CharField(
        max_length=50,
        choices=[
            ('happy', 'Happy'),
            ('sad', 'Sad'),
            ('energetic', 'Energetic'),
            ('calm', 'Calm'),
            ('romantic', 'Romantic'),
            ('melancholic', 'Melancholic'),
            ('angry', 'Angry'),
            ('hopeful', 'Hopeful'),
            ('nostalgic', 'Nostalgic'),
            ('chill', 'Chill'),
            ('dark', 'Dark'),
            ('uplifting', 'Uplifting'),
            ('','---'),
            ('epic', 'Epic'),
            ('dreamy', 'Dreamy'),
            ('lonely', 'Lonely'),
            ('sensual', 'Sensual'),
            ('confident', 'Confident'),
            ('breakup', 'Breakup'),       
            ('sarcastic', 'Sarcastic'),  
            ('empowered', 'Empowered'),   
            ('rebellious', 'Rebellious'), 
        ],
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    copyright = models.CharField(max_length=255, blank=True, null=True)

    def clean(self):
        super().clean()
        if self.audio_file:
            ext = os.path.splitext(self.audio_file.name)[1]
            if ext.lower() != '.mp3':
                raise ValidationError({'audio_file': 'Solo se permiten archivos .mp3'})

