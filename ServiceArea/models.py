from django.db import models

# Create your models here.
class Provider(models.Model):
    name = models.CharField(max_length=200, default='')
    email = models.CharField(max_length=200, default='')
    phone = models.CharField(max_length=200, default='')
    language = models.CharField(max_length=100, default='')
    currency = models.CharField(max_length=100, default='')
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Area(models.Model):
    provider_id = models.IntegerField(default=0)
    name = models.CharField(max_length=200, default='')
    price = models.FloatField(default=0)
    geojson = models.TextField(default='')
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)