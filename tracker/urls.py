from django.urls import path
from . import views

urlpatterns = [
    path("api/track", views.track_domain, name="track_domain"),
    path("api/entries", views.get_entries, name="get_entries"),
]

