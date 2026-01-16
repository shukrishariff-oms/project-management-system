from database import SessionLocal, engine
from sqlalchemy import text

def drop_table():
    with engine.connect() as connection:
        connection.execute(text("DROP TABLE IF EXISTS project_tasks"))
        connection.commit()
    print("Dropped table project_tasks")

if __name__ == "__main__":
    drop_table()
