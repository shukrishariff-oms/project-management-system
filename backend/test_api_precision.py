import requests
import sys

BASE_URL = "http://localhost:8000"

def test_precision():
    print(f"Testing against {BASE_URL}...")
    
    # payload
    data = {
        "name": "Precision Test Project",
        "start_date": "2026-01-01",
        "end_date": "2026-12-31",
        "planned_cost": 2000000.0,
        "actual_cost": 0.0,
        "status": "Not Started"
    }
    
    try:
        # Create
        print("Creating project with planned_cost=2000000.0 ...")
        res = requests.post(f"{BASE_URL}/api/projects", json=data)
        if res.status_code != 200:
            print(f"Failed to create: {res.status_code} {res.text}")
            return
        
        proj = res.json()
        pid = proj['id']
        val = proj.get('planned_cost')
        print(f"Create Response planned_cost: {val} (Type: {type(val)})")
        
        if val != 2000000.0:
            print("❌ MISMATCH ON CREATE!")
        else:
            print("✅ MATCH ON CREATE")
            
        # Update (PUT)
        print("Updating project with planned_cost=2000000.0 ...")
        update_data = {
            "name": "Precision Test Project Updated",
            "planned_cost": 2000000.0
        }
        res = requests.put(f"{BASE_URL}/api/projects/{pid}", json=update_data)
        if res.status_code != 200:
            print(f"Failed to update: {res.status_code} {res.text}")
        else:
            proj = res.json()
            val = proj.get('planned_cost')
            print(f"Update Response planned_cost: {val}")
            
            if val != 2000000.0:
                 print("❌ MISMATCH ON UPDATE!")
            else:
                 print("✅ MATCH ON UPDATE")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_precision()
