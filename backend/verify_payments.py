import requests
import json

try:
    response = requests.get('http://localhost:8000/api/projects')
    projects = response.json()
    
    miqadya = next((p for p in projects if p['name'] == 'MiQaDya'), None)
    
    if miqadya:
        print(f"Project Found: {miqadya['name']}")
        print(f"Total Payments: {len(miqadya['payments'])}")
        print("Sample Payment:")
        print(json.dumps(miqadya['payments'][0], indent=2))
        
        # Check specific new fields
        print(f"PO Number present? {'po_number' in miqadya['payments'][0]}")
    else:
        print("Project MiQaDya not found!")

except Exception as e:
    print(f"Error: {e}")
