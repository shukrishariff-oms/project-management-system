import requests
from datetime import date

# Base URL
BASE_URL = "http://localhost:8000"

# Create a project first
print("Creating test project...")
project_data = {
    "name": "Contract Ledger Test Project",
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "planned_cost": 100000.0,
    "actual_cost": 0.0
}

response = requests.post(f"{BASE_URL}/api/projects", json=project_data)

if response.status_code == 200:
    project = response.json()
    project_id = project["id"]
    print(f"Created project ID: {project_id}")
    
    # Add a payment
    print("Adding payment...")
    payment_data = {
        "deliverable": "System Design & Architecture",
        "phase": "Phase 1",
        "plan_date": "2026-03-01",
        "planned_amount": 50000.0,
        "paid_amount": 0.0,
        "status": "Not Paid",
        "remark": "Initial design phase",
        "payment_date": None,
        "po_number": None,
        "invoice_number": None
    }
    
    response = requests.post(
        f"{BASE_URL}/api/projects/{project_id}/payment",
        json=payment_data
    )
    
    if response.status_code == 200:
        print("Payment added successfully!")
        print(response.json())
    else:
        print(f"Error adding payment: {response.status_code}")
        print(response.text)
    
    # Get project details
    print("Fetching details...")
    response = requests.get(f"{BASE_URL}/api/projects/{project_id}/details")
    if response.status_code == 200:
        print("\\nProject details fetched successfully!")
    else:
        print(f"\\nError getting details: {response.status_code}")
        print(response.text)

else:
    print(f"Error creating project: {response.status_code}")
    print(response.text)
