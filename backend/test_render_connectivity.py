import urllib.request
import urllib.error
import json

def test_render():
    base_url = "https://project-management-system-uskt.onrender.com"
    endpoints = ["/", "/users", "/login", "/api/projects"]
    
    for ep in endpoints:
        url = base_url + ep
        print(f"\nTesting {url}...")
        try:
            req = urllib.request.Request(url, method='GET')
            with urllib.request.urlopen(req) as res:
                print(f"Status: {res.status}")
                print(f"Body: {res.read().decode('utf-8')[:100]}")
        except urllib.error.HTTPError as e:
            print(f"HTTP Error: {e.code} - {e.reason}")
            try:
                print(f"Body: {e.read().decode('utf-8')}")
            except:
                pass
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_render()
