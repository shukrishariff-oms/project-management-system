import sqlite3

def migrate():
    print("Migrating database...")
    try:
        conn = sqlite3.connect("sql_app.db")
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE payment_schedule ADD COLUMN supporting_document VARCHAR")
        conn.commit()
        conn.close()
        print("Migration successful: Added supporting_document to payment_schedule")
    except Exception as e:
        print(f"Migration failed (might already exist): {e}")

    try:
        conn = sqlite3.connect("sql_app_v2.db")
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE payment_schedule ADD COLUMN supporting_document VARCHAR")
        conn.commit()
        conn.close()
        print("Migration successful: Added supporting_document to payment_schedule (v2)")
    except Exception as e:
        print(f"Migration failed (v2) (might already exist): {e}")

if __name__ == "__main__":
    migrate()
