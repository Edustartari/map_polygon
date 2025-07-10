from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render
from ServiceArea.models import *
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import hashlib
import os
import requests
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from mozio.settings import CLIENT_ID

# Create your views here.
def index(request):
    state_token = request.session.get('state', None)
    if state_token is None:
        # Generate a new state token and store it in the session
        state_token = hashlib.sha256(os.urandom(1024)).hexdigest()
        print('state_token', state_token)
        request.session['state'] = state_token
    else:
        print('Using existing state_token:', state_token)

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
            'area_id': area.id,
            'area_name': area.name,
            'polygon_area': json.loads(area.geojson)
        })

    context = {
        'data_list': json.dumps(data_list),
    }
    return render(request, "index.html", context)

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
    else:
        provider_object = Provider(
            name=dict_data['name'],
            email=dict_data['email'],
            phone=dict_data['phone'],
        )
    provider_object.save()

    if 'area_id' in dict_data and dict_data['area_id'] != '':
        area_object = Area.objects.filter(id=dict_data['area_id'])
        if area_object.count() > 0:
            area_object = area_object[0]
            area_object.name = dict_data['area_name']
            area_object.geojson = json.dumps(dict_data['polygon_area'])
            area_object.save()

    else:
        area_object = Area(
            provider_id=provider_object.id,
            name=dict_data['area_name'],
            geojson=json.dumps(dict_data['polygon_area']),
        )
    area_object.save()

    response = {
        'status': 'success',
        'area_id': area_object.id,
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

@csrf_exempt
def google_login(request):
    print('')
    print('google_login')

    # https://accounts.google.com/o/oauth2/v2/auth
    # https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=https%3A%2F%2Fdevelopers.google.com%2Foauthplayground&prompt=consent&response_type=code&client_id=407408718192.apps.googleusercontent.com&scope=email&access_type=offline
    # Test later scope=email,openid
    # https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://127.0.0.1:8000&prompt=consent&response_type=code&client_id=CLIENT_ID&scope=email&access_type=offline&nonce=nonce

    nonce = request.GET.get('nonce', None)
    if nonce is None:
        nonce = hashlib.sha256(os.urandom(1024)).hexdigest()
        request.session['nonce'] = nonce

    state_token = request.session.get('state', None)
    if state_token is None:
        state_token = hashlib.sha256(os.urandom(1024)).hexdigest()
        request.session['state'] = state_token

    user_email = request.session.get('user_email', None)
    login_hint = ''
    if user_email:
        login_hint = '&login_hint=' + user_email
    # https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http%3A%2F%2F127.0.0.1%3A8000&prompt=consent&response_type=code&client_id=CLIENT_ID&scope=openid%20email&access_type=offline&nonce=nonce&state=state_token + login_hint
    # url = f"https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http%3A%2F%2F127.0.0.1%3A8000%2Fredirect-login&prompt=consent&response_type=code&client_id={CLIENT_ID}&scope=openid%20email&access_type=offline&nonce={nonce}&state={state_token}"
    url = f"https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=https%3A%2F%2Fmap-polygon.vercel.app%2Fredirect-login&prompt=consent&response_type=code&client_id={CLIENT_ID}&scope=openid%20email&access_type=offline&nonce={nonce}&state={state_token}"
    response = requests.get(url)
    print(response)
    print('********************************************************')
    print('********************************************************')
    print('********************************************************')
    print('********************************************************')
    print('********************************************************')
    # print(response.content)
    # Get response
    # results_json = json.loads(response.content)
    # print(results_json)
    redirect_url = response.url
    print('redirect_url: ', redirect_url)

    response = {
        'status': 'success',
        'redirect_url': redirect_url,
    }
    return JsonResponse(response)

@csrf_exempt
def redirect_login(request):
    print('')
    print('redirect_login')
    
    response = {
        'status': 'success',
    }
    return JsonResponse(response)