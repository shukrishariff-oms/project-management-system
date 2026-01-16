from database import SessionLocal, engine
from sqlalchemy import text

def drop_table():
    with engine.connect() as connection:
        connection.execute(text("DROP TABLE IF EXISTS matters_arising"))
        connection.commit()
    print("Dropped table matters_arising")

if __name__ == "__main__":
    drop_table()
