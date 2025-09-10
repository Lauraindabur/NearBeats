# Este archivo urls.py permite definir rutas específicas para la app 'artist'.
# Así, podemos organizar mejor las vistas relacionadas con artistas y mantener
# separadas las rutas de cada app, facilitando el mantenimiento y la escalabilidad del proyecto.

from django.urls import path
from . import views

urlpatterns = [
    #path('profile/<str:artist_name>/', views.see_artist_graphic, name='artist_profile'),
    path('profile/<str:artist_name>/', views.get_artist_dashboard, name='get_artist_dashboard'),
]
