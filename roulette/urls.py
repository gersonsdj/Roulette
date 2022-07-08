
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("positions", views.positions, name="positions"),
    path("methods", views.methods, name="methods"),
    path("strategy", views.strategy, name="strategy"),
    path("strategies", views.strategies, name="strategies"),
    path("testing/<int:strategy>", views.testing, name="testing"),
]
