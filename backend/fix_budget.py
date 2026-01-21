import sqlite3
import time

DB_FILE = "sql_app_v2.db"
TARGET_PROJECT = "Call Center and CRM System"
TARGET_BUDGET = 2000000.0

def fix_budget():
    print(f"Connecting to {DB_FILE} with 30s timeout...")
    conn = sqlite3.connect(DB_FILE, timeout=30.0)
    cursor = conn.cursor()
    
    try:
        # Check current value
        cursor.execute("SELECT id, name, planned_cost FROM projects WHERE name = ?", (TARGET_PROJECT,))
        row = cursor.fetchone()
        
        if not row:
            print(f"Project '{TARGET_PROJECT}' not found!")
            print("Searching for partial match 'Call Center'...")
            cursor.execute("SELECT id, name, planned_cost FROM projects WHERE name LIKE ?", ('%Call Center%',))
            row = cursor.fetchone()
            if not row:
                print("No partial match found either.")
                return

        pid, name, cost = row
        print(f"Found Project: ID={pid}, Name='{name}', Current Cost={cost}")
        
        if abs(cost - TARGET_BUDGET) < 0.001:
            print("Budget is already correct (within float precision).")
        else:
            print(f"Updating budget to {TARGET_BUDGET:.1f}...")
            cursor.execute("UPDATE projects SET planned_cost = ? WHERE id = ?", (TARGET_BUDGET, pid))
            conn.commit()
            print("Update committed successfully.")
            
            # Verify
            cursor.execute("SELECT planned_cost FROM projects WHERE id = ?", (pid,))
            new_cost = cursor.fetchone()[0]
            print(f"New Value in DB: {new_cost}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    fix_budget()
