from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def clear_all_tasks():
    db = SessionLocal()
    try:
        # 1. Delete all tasks
        deleted_rows = db.query(models.ProjectTask).delete()
        print(f"Deleted {deleted_rows} tasks.")

        # 2. Reset Project Progress
        projects = db.query(models.Project).all()
        for p in projects:
            p.progress_percentage = 0
            # Optional: Reset status if desired, but user only said "progress"
            # p.status = "Not Started" 
            print(f"Reset progress for project: {p.name}")
        
        db.commit()
        print("All tasks cleared and project progress reset to 0%.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure tables exist (just in case)
    models.Base.metadata.create_all(bind=engine)
    clear_all_tasks()
