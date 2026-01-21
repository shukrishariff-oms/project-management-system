import sqlite3
import time

DB_FILE = "sql_app_v2.db"

def check_costs():
    conn = sqlite3.connect(DB_FILE, timeout=10.0)
    cursor = conn.cursor()
    
    try:
        print(f"{'ID':<5} | {'Planned Cost':<15} | {'Name'}")
        print("-" * 50)
        cursor.execute("SELECT id, name, planned_cost FROM projects")
        rows = cursor.fetchall()
        
        for pid, name, cost in rows:
            print(f"{pid:<5} | {cost:<15} | {name}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_costs()
