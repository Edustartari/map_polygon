from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render
from ServiceArea.models import *
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Create your views here.
def index(request):
    data_list = []
    providers_objects = Provider.objects.all()
    providers_dict = {provider.id:provider for provider in providers_objects}
    area_object = Area.objects.all()
    for area in area_object:
        provider = providers_dict[area.provider_id]
        data_list.append({
            'provider_id': provider.id,
            'name': provider.name,
            'email': provider.email,
            'phone': provider.phone,
            'language': provider.language,
            'currency': provider.currency,
            'area_id': area.id,
            'area_name': area.name,
            'price': area.price,
            'polygon_area': json.loads(area.geojson)
        })

    context = {
        'data_list': json.dumps(data_list),
    }
    return render(request, "ServiceArea/index.html", context)

@csrf_exempt
def save_form(request):

    dict_data = request.POST['dict_data']
    dict_data = json.loads(dict_data)

    provider_object = Provider.objects.filter(name=dict_data['email'])
    if provider_object.count() > 0:
        provider_object = provider_object[0]
        provider_object.name = dict_data['name']
        provider_object.email = dict_data['email']
        provider_object.phone = dict_data['phone']
        provider_object.language = dict_data['language']
        provider_object.currency = dict_data['currency']
    else:
        provider_object = Provider(
            name=dict_data['name'],
            email=dict_data['email'],
            phone=dict_data['phone'],
            language=dict_data['language'],
            currency=dict_data['currency'],
        )
    provider_object.save()

    if 'area_id' in dict_data and dict_data['area_id'] != '':
        area_object = Area.objects.filter(id=dict_data['area_id'])
        if area_object.count() > 0:
            area_object = area_object[0]
            area_object.name = dict_data['area_name']
            area_object.price = dict_data['price']
            area_object.geojson = json.dumps(dict_data['polygon_area'])
            area_object.save()

    else:
        area_object = Area(
            provider_id=provider_object.id,
            name=dict_data['area_name'],
            price=dict_data['price'],
            geojson=json.dumps(dict_data['polygon_area']),
        )
    area_object.save()

    response = {
        'status': 'success',
    }
    return JsonResponse(response)

@csrf_exempt
def delete_form(request):

    area_id = request.POST['area_id']
    area_id = json.loads(area_id)

    area_object = Area.objects.get(id=area_id).delete()
    
    response = {
        'status': 'success',
    }
    return JsonResponse(response)