from django.urls import path
from . import views

urlpatterns = [
    path('ajax-toggle-follow/', views.ajax_toggle_follow, name='ajax_toggle_follow'),
    path('get-followers-count/', views.view_artist_followers, name='view_artist_followers'),
    path('notifications-unread/', views.notifications_unread, name='notifications_unread'),
    path('notifications-mark-read/', views.notifications_mark_read, name='notifications_mark_read'),


]