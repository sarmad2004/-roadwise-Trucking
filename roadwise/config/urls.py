from django.urls import path
from planner import views

urlpatterns = [
    path("api/health", views.health), path("api/demo", views.demo_view),
    path("api/plan", views.plan), path("api/fuel", views.fuel_view),
]
