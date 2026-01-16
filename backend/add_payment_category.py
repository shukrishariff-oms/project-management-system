import sqlite3
import os

DB_FILE = "sql_app_v2.db"

def add_category_column():
    if not os.path.exists(DB_FILE):
        print(f"Error: Database file '{DB_FILE}' not found.")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(payment_schedule)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "category" in columns:
            print("Column 'category' already exists.")
        else:
            print("Adding 'category' column...")
            cursor.execute("ALTER TABLE payment_schedule ADD COLUMN category TEXT DEFAULT 'Project Implementation'")
            conn.commit()
            print("Successfully added 'category' column.")
            
    except Exception as e:
        print(f"Error updating database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_category_column()
