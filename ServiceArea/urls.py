from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("save-form/", views.save_form, name="save_form"),
    path("delete-form/", views.delete_form, name="delete_form"),
    path("google-login/", views.google_login, name="google_login"),
    path("redirect-login/", views.redirect_login, name="redirect_login"),
    path("logout/", views.logout, name="logout"),
]