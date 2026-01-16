import urllib.request
import urllib.error
import json
import sys

def create_user():
    url = "http://127.0.0.1:8000/users"
    payload = {
        "email": "admin@ijn.com.my",
        "password": "password",
        "full_name": "System Admin",
        "role": "admin"
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')

    try:
        with urllib.request.urlopen(req) as response:
            print(f"User created successfully: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        if e.code == 400:
             print("User likely already exists (400 Bad Request)")
        else:
            print(f"Failed to create user: {e.code} - {e.read().decode('utf-8')}")
            sys.exit(1)
    except Exception as e:
        print(f"Error connection to server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_user()
