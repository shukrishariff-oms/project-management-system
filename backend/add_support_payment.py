from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from datetime import date

def add_support_payment():
    db = SessionLocal()
    try:
        # Search for project
        search_term = "Miqadya"
        project = db.query(models.Project).filter(models.Project.name.ilike(f"%{search_term}%")).first()
        
        if not project:
            # Try wider search if exact match fails
            projects = db.query(models.Project).all()
            print(f"Project '{search_term}' not found. Available projects:")
            for p in projects:
                print(f"- {p.name} (ID: {p.id})")
            return

        print(f"Found project: {project.name} (ID: {project.id})")

        # Create Payment
        payment = models.PaymentSchedule(
            project_id=project.id,
            category="Support & Maintenance",
            deliverable="Annual Support & Maintenance",
            phase="Post-Implementation",
            plan_date=date(2026, 2, 1), # Assuming start next month
            planned_amount=680000.00,
            status="Not Paid",
            remark="Added via System Request"
        )
        
        db.add(payment)
        
        # Update Project Planned Cost if needed (Optional, usually sum of payments but project has its own field)
        # project.planned_cost += 680000.00 
        
        db.commit()
        print(f"Successfully added Support & Maintenance payment (RM 680,000) to {project.name}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_support_payment()
