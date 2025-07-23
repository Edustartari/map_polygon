import os, sys, requests, json
import pytest
from ServiceArea.views import *
from rest_framework.test import APIClient
from ServiceArea.tests.mock_data.unit_mock import *

client = APIClient()

def test_email_validation():
    assert validate_email('test@mail.com') == True
    assert validate_email('test@1') == False

# def test_add_percentage_info():
#     assert add_percentage_info() == True

# def test_get_constructors_stats():
#     response = client.get('/get-constructors-stats')
#     json_data = json.loads(response.content)
#     assert response.status_code == 200
#     assert 'constructors' in json_data, f"json_data don't possess constructors key"
#     assert len(json_data['constructors']) > 0, f"constructors list is empty"

@pytest.mark.django_db
def test_index():
    response = client.get('')
    assert response.status_code == 200

def test_save_form():
    data = json.dumps({
        'dict_data': save_form_mock_json
    })
    response = client.post('/save-form/', data,
        content_type='application/json'
    )
    assert response.status_code == 200

# def test_pilots():
#     response = client.get('/pilots')
#     assert response.status_code == 200

# def test_all_time():
#     response = client.get('/all-time')
#     assert response.status_code == 200

# def test_load_nationalities():
#     response = client.get('/load-nationalities')
#     json_data = json.loads(response.content)
#     assert response.status_code == 200
#     assert 'nationalities' in json_data, f"json_data don't possess nationalities key"
#     assert len(json_data['nationalities']) > 0, f"nationalities list is empty"

# def pilots_list():
#     response = client.get('/pilots-list')
#     json_data = json.loads(response.content)
#     assert response.status_code == 200
#     assert 'drivers' in json_data, f"json_data don't possess drivers key"
#     assert len(json_data['drivers']) > 0, f"drivers list is empty"

# def pilots_complete_info():
#     response = client.get('/pilots-complete-info')
#     json_data = json.loads(response.content)
#     assert response.status_code == 200
#     assert 'drivers' in json_data, f"json_data don't possess drivers key"
#     assert len(json_data['drivers']) > 0, f"drivers list is empty"

# def test_constructors():
#     response = client.get('/constructors')
#     assert response.status_code == 200

# def test_others():
#     response = client.get('/others')
#     assert response.status_code == 200