import bcrypt
from datetime import date, timedelta
from sqlalchemy.orm import Session
import models, database

def get_password_hash(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def reseed():
    # Drop and recreate tables to apply schema changes
    print("Dropping all tables...")
    models.Base.metadata.drop_all(bind=database.engine)
    print("Recreating all tables...")
    models.Base.metadata.create_all(bind=database.engine)
    
    db = database.SessionLocal()
    try:
        # Create Users
        print("Seeding users...")
        admin_pass = get_password_hash("admin")
        staff_pass = get_password_hash("staff")
        
        admin = models.User(
            email="admin@ijn.com.my", 
            password_hash=admin_pass, 
            full_name="Shukri Shariff", 
            role="admin"
        )
        staff = models.User(
            email="staff@ijn.com.my", 
            password_hash=staff_pass, 
            full_name="Khairul Amri", 
            role="staff"
        )
        db.add(admin)
        db.add(staff)
        db.commit()

        # Create Projects
        print("Seeding projects...")
        projects = [
            models.Project(
                name="CMS Implementation",
                project_code="PJ001",
                project_manager="Khairul Amri",
                assigned_to_email="staff@ijn.com.my",
                description="New Content Management System deployment",
                status="Running",
                progress_percentage=45,
                start_date=date.today() - timedelta(days=30),
                end_date=date.today() + timedelta(days=60),
                planned_cost=50000.0,
                actual_cost=15000.0
            ),
            models.Project(
                name="HR Portal Upgrade",
                project_code="PJ002",
                project_manager="Khairul Amri",
                assigned_to_email="staff@ijn.com.my",
                description="Upgrade existing HR portal to v3.0",
                status="Running",
                progress_percentage=20,
                start_date=date.today() - timedelta(days=10),
                end_date=date.today() + timedelta(days=90),
                planned_cost=35000.0,
                actual_cost=5000.0
            ),
            models.Project(
                name="Network Security Audit",
                project_code="PJ003",
                project_manager="Shukri Shariff",
                assigned_to_email="admin@ijn.com.my",
                description="Annual security audit",
                status="Running",
                progress_percentage=10,
                start_date=date.today(),
                end_date=date.today() + timedelta(days=30),
                planned_cost=20000.0,
                actual_cost=0.0
            )
        ]

        for p in projects:
            db.add(p)
            db.commit()
            db.refresh(p)
            
            # Add default health
            health = models.ProjectHealth(
                project_id=p.id,
                schedule_status="Good",
                budget_status="Good",
                risk_status="Good"
            )
            db.add(health)
            
        db.commit()
        print("Reseed complete!")
        
    except Exception as e:
        print(f"Error reseeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reseed()
