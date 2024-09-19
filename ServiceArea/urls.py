from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("save-form/", views.save_form, name="save_form"),
    path("delete-form/", views.delete_form, name="delete_form"),
]