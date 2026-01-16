import requests
import os

url = "http://localhost:8000/api/projects/3/payments/import"
file_path = "dummy_payments.xlsx"

if not os.path.exists(file_path):
    print(f"File {file_path} not found")
    exit(1)

files = {'file': open(file_path, 'rb')}
try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
