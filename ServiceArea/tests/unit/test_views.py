import os, sys, requests, json
import pytest
from ServiceArea.views import *
from rest_framework.test import APIClient
from ServiceArea.tests.mock_data.unit_mock import *

client = APIClient()

def test_email_validation():
    assert validate_email('test@mail.com') == True
    assert validate_email('test@1') == False

@pytest.mark.django_db
def test_index():
    response = client.get('')
    assert response.status_code == 200