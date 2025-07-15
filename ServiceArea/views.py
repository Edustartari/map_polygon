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
    state_token = request.session.get('state', None)
    if state_token is None:
        # Generate a new state token and store it in the session
        state_token = hashlib.sha256(os.urandom(1024)).hexdigest()
        print('state_token', state_token)
        # Set key to expire in one day
        success = redis_client.set("state_token", state_token, ex=86400)
    else:
        print('Using existing state_token:', state_token)

    # Get user_info from request
    user_info = request.GET.get('user_info', None)
    print('user_info: ', user_info)
    if user_info is not None:
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
    print('')
    print('google_login')

    nonce = redis_client.get("nonce")
    if nonce is None:
        nonce = hashlib.sha256(os.urandom(1024)).hexdigest()
        redis_client.set("nonce", nonce, ex=86400)

    state_token = redis_client.get("state_token")
    if state_token is None:
        state_token = hashlib.sha256(os.urandom(1024)).hexdigest()
        redis_client.set("state_token", state_token, ex=86400)

    user_email = redis_client.get("user_email")
    login_hint = ''
    if user_email:
        login_hint = '&login_hint=' + user_email
    # redirect_url = f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&scope=openid%20profile%20email&redirect_uri=https://76565d5a1aef.ngrok-free.app/redirect-login/&state={state_token}&nonce={nonce}&access_type=offline" + login_hint
    redirect_url = f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&scope=openid%20profile%20email&redirect_uri=https://map-polygon.vercel.app/redirect-login/&state={state_token}&nonce={nonce}&access_type=offline" + login_hint

    print(redirect_url)

    response_dict = {
        'status': 'success',
        'redirect_url': redirect_url,
    }
    return JsonResponse(response_dict)

@csrf_exempt
def redirect_login(request):
    print('')
    print('redirect_login')

    code = request.GET.get('code', None)
    print('code: ', code)
    if code is None:
        return HttpResponse("No code provided in the request.")

    state = request.GET.get('state', None)
    print('state: ', state)
    if state is None:
        return HttpResponse("No state token found in session.")

    state_token = redis_client.get("state_token")
    print('state_token: ', state_token)
    if state_token is None:
        return HttpResponse("No state_token provided in the request.")

    # Compare the state token with the one in the request
    if state != state_token:
        return HttpResponse("State token does not match.")

    response = requests.post(
        'https://oauth2.googleapis.com/token',
        data={
            'code': code,
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            # 'redirect_uri': 'https://76565d5a1aef.ngrok-free.app/redirect-login/',
            'redirect_uri': 'https://map-polygon.vercel.app/redirect-login/',
            'grant_type': 'authorization_code',
        }
    )
    print('response: ', response)
    if response.status_code != 200:
        return HttpResponse("Failed to exchange code for access token.")
    response_data = response.json()
    print('response_data: ', response_data)

    access_token = response_data.get('access_token', None)
    print('access_token: ', access_token)
    if access_token is None:
        return HttpResponse("No access token found in response.")

    expires_in = response_data.get('expires_in', None)
    id_token = response_data.get('id_token', None)
    scope = response_data.get('scope', None)
    token_type = response_data.get('token_type', None)
    refresh_token = response_data.get('refresh_token', None)

    print('id_token: ', id_token)
    # Decode the ID token to get user information
    user_info_response = requests.get(
        'https://openidconnect.googleapis.com/v1/userinfo',
        headers={
            'Authorization': f'Bearer {access_token}'
        }
    )
    print('user_info_response: ', user_info_response)
    user_info = {}
    if user_info_response.status_code == 200:
        user_info_dict = user_info_response.json()
        user_info['email'] = user_info_dict.get('email', None)
        user_info['picture'] = user_info_dict.get('picture', None)
        user_info['name'] = user_info_dict.get('name', None)
        user_info['given_name'] = user_info_dict.get('given_name', None)
        user_info['family_name'] = user_info_dict.get('family_name', None)

    # Redirect to the index page with user_info
    # redirect_url = f"https://76565d5a1aef.ngrok-free.app/?user_info={json.dumps(user_info)}"
    redirect_url = f"https://map-polygon.vercel.app/?user_info={json.dumps(user_info)}"
    return redirect(redirect_url)
