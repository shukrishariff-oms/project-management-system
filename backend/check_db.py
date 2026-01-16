import sqlite3
import os

db_path = 'sql_app_v2.db'
if not os.path.exists(db_path):
    print(f"Database file not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
try:
    cursor.execute('SELECT email, full_name, role FROM users')
    users = cursor.fetchall()
    if not users:
        print("No users found in database.")
    for user in users:
        print(f"Email: {user[0]}, Name: {user[1]}, Role: {user[2]}")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
