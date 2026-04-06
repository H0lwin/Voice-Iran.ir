from django.urls import path

from .views import api_root, health_check

app_name = "api"

urlpatterns = [
    path("", api_root, name="root"),
    path("health/", health_check, name="health"),
]
