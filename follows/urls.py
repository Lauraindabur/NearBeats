from django.urls import path
from . import views

urlpatterns = [
    path('ajax-toggle-follow/', views.ajax_toggle_follow, name='ajax_toggle_follow'),
    path('get-followers-count/', views.get_followers_count, name='get_followers_count'),

]