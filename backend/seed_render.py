import urllib.request
import urllib.error
import json
import sys

def seed_render():
    # Render URL
    url = "https://project-management-system-uskt.onrender.com/users"
    
    payload = {
        "email": "admin@ijn.com.my",
        "password": "admin", # Updated to match your preference/reseed script
        "full_name": "Shukri Shariff",
        "role": "admin"
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')

    print(f"Connecting to {url}...")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"User created successfully on Render: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        if e.code == 400:
             print("User likely already exists on Render (400 Bad Request)")
        else:
            print(f"Failed to create user on Render: {e.code} - {e.read().decode('utf-8')}")
            sys.exit(1)
    except Exception as e:
        print(f"Error connecting to Render: {e}")
        sys.exit(1)

if __name__ == "__main__":
    seed_render()
