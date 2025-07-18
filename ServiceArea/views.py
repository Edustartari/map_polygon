from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from ServiceArea.models import *
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import hashlib
import os
import requests
from django.shortcuts import redirect
import redis
import os
from dotenv import load_dotenv
from mozio.settings import *

redis_client = redis.Redis.from_url(REDIS_URL)

# Create your views here.
def index(request):
    # Get session_hash from cookies
    session_hash = request.COOKIES.get('session_hash', None)
    user_info = None
    if session_hash:
        user_info = redis_client.get(str(session_hash))
    if user_info:
        user_info = json.loads(user_info)
    else:
        user_info = {}

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
        'user_info': json.dumps(user_info),
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
    session_hash = request.COOKIES.get('session_hash', None)
    session_hash = redis_client.get(session_hash) if session_hash else None
    nonce = hashlib.sha256(os.urandom(1024)).hexdigest()
    if session_hash:
        # Redirect to the index page
        # response = HttpResponseRedirect("https://861c9d29cfd0.ngrok-free.app/")
        response = HttpResponseRedirect("https://map-polygon.vercel.app/")
        return response
    else:
        session_hash = hashlib.sha256(os.urandom(1024)).hexdigest()
        redis_client.set(session_hash, json.dumps({'nonce': nonce}), ex=86400)

    # redirect_url = f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&scope=openid%20profile%20email&redirect_uri=https://861c9d29cfd0.ngrok-free.app/redirect-login/&state={session_hash}&nonce={nonce}&access_type=offline"
    redirect_url = f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&scope=openid%20profile%20email&redirect_uri=https://map-polygon.vercel.app/redirect-login/&state={session_hash}&nonce={nonce}&access_type=offline"


    response_dict = {
        'status': 'success',
        'redirect_url': redirect_url,
    }
    return JsonResponse(response_dict)

@csrf_exempt
def redirect_login(request):

    code = request.GET.get('code', None)
    if code is None:
        return HttpResponse("No code provided in the request.")

    state = str(request.GET.get('state', None))
    if state is None:
        return HttpResponse("No state token found in session.")

    session_hash = state
    user_info = redis_client.get(session_hash)
    if user_info is None:
        return HttpResponse("No session_hash provided in the request.")
    user_info = json.loads(user_info)

    response = requests.post(
        'https://oauth2.googleapis.com/token',
        data={
            'code': code,
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            # 'redirect_uri': 'https://861c9d29cfd0.ngrok-free.app/redirect-login/',
            'redirect_uri': 'https://map-polygon.vercel.app/redirect-login/',
            'grant_type': 'authorization_code',
        }
    )
    if response.status_code != 200:
        return HttpResponse("Failed to exchange code for access token.")
    response_data = response.json()

    access_token = response_data.get('access_token', None)
    if access_token is None:
        return HttpResponse("No access token found in response.")

    expires_in = response_data.get('expires_in', None)
    id_token = response_data.get('id_token', None)
    scope = response_data.get('scope', None)
    token_type = response_data.get('token_type', None)
    refresh_token = response_data.get('refresh_token', None)

    # Decode the ID token to get user information
    user_info_response = requests.get(
        'https://openidconnect.googleapis.com/v1/userinfo',
        headers={
            'Authorization': f'Bearer {access_token}'
        }
    )
    if user_info_response.status_code == 200:
        user_info_dict = user_info_response.json()
        user_info['email'] = user_info_dict.get('email', None)
        user_info['picture'] = user_info_dict.get('picture', None)
        user_info['name'] = user_info_dict.get('name', None)
        user_info['given_name'] = user_info_dict.get('given_name', None)
        user_info['family_name'] = user_info_dict.get('family_name', None)

    redis_client.set(session_hash, json.dumps(user_info), ex=86400)  # 1 day expiration
        
    # Set session_hash cookie in the response
    # response = HttpResponseRedirect("https://861c9d29cfd0.ngrok-free.app/")
    response = HttpResponseRedirect("https://map-polygon.vercel.app/")
    response.set_cookie('session_hash', session_hash, max_age=86400, secure=True, httponly=True)  # 1 day expiration
    return response

def logout(request):
    session_hash = request.COOKIES.get('session_hash', None)
    if session_hash:
        redis_client.delete(session_hash)
    
    response = HttpResponseRedirect("https://map-polygon.vercel.app/")
    # response = HttpResponseRedirect("https://861c9d29cfd0.ngrok-free.app/")
    response.delete_cookie('session_hash')
    return response