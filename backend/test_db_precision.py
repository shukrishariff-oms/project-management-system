from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
from datetime import date

# Use in-memory SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

def test_memory_precision():
    print("Testing In-Memory DB Precision...")
    
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        # Create
        print("Creating project in MEMORY DB with planned_cost=2000000.0")
        p = models.Project(
             name="Memory Precision Test",
             start_date=date.today(),
             end_date=date.today(),
             planned_cost=2000000.0,
             status="Not Started"
        )
        db.add(p)
        db.commit()
        db.refresh(p)
        
        print(f"ID: {p.id}")
        val = p.planned_cost
        print(f"Stored Value: {val:.20f}")
        
        if val == 2000000.0:
            print("✅ MATCH (Memory DB)")
        else:
            print(f"❌ MISMATCH (Memory DB): {val}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_memory_precision()
