from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String, nullable=True)
    role = Column(String, default="staff") # admin or staff

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    project_code = Column(String, nullable=True, unique=True, index=True)
    project_manager = Column(String, nullable=True) # Display Name
    assigned_to_email = Column(String, nullable=True, index=True) # Linked Staff Email
    description = Column(String, nullable=True)
    objective = Column(String, nullable=True)
    status = Column(String, default="In Progress") # Not Started, In Progress, On Hold, Completed, Delayed
    priority = Column(String, default="Medium") # Low, Medium, High
    risk_level = Column(String, default="Low") # Low, Medium, High
    department = Column(String, nullable=True)
    is_archived = Column(Integer, default=0) # 0 = Active, 1 = Archived
    tags = Column(String, nullable=True)
    progress_percentage = Column(Integer, default=0)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    planned_cost = Column(Float, nullable=False)
    actual_cost = Column(Float, default=0.0)
    
    # Relationship to health metrics
    health = relationship("ProjectHealth", back_populates="project", uselist=False)
    payments = relationship("PaymentSchedule", back_populates="project", cascade="all, delete-orphan")
    matters = relationship("MattersArising", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("ProjectTask", back_populates="project", cascade="all, delete-orphan")

class ProjectHealth(Base):
    __tablename__ = "project_health"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    schedule_status = Column(String, default="Good")  # Good, At Risk, Critical
    budget_status = Column(String, default="Good")
    risk_status = Column(String, default="Good")
    scope_status = Column(String, default="Good")
    resource_status = Column(String, default="Good")
    
    # Relationship back to project
    project = relationship("Project", back_populates="health")

class PaymentSchedule(Base):
    __tablename__ = "payment_schedule"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Contract Ledger Fields
    category = Column(String, default="Project Implementation")
    deliverable = Column(String, nullable=False)
    phase = Column(String, nullable=False)
    plan_date = Column(Date, nullable=False)
    planned_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0.0)
    status = Column(String, default="Not Paid")  # Paid, Not Paid
    
    # Optional tracking fields
    remark = Column(String, nullable=True)
    payment_date = Column(Date, nullable=True)
    po_number = Column(String, nullable=True)
    invoice_number = Column(String, nullable=True)
    supporting_document = Column(String, nullable=True)
    
    project = relationship("Project", back_populates="payments")

class MattersArising(Base):
    __tablename__ = "matters_arising"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Tracking Fields
    date_raised = Column(Date, nullable=False)
    issue_description = Column(String, nullable=False) # Matter Arising
    level = Column(String, default="Medium") # Level: High, Med, Low, TBC
    action_updates = Column(String, nullable=True) # Long text for Action Required / Updated
    pic = Column(String, nullable=True) # Person In Charge
    target_date = Column(Date, nullable=True)
    status = Column(String, default="Open") # Open, Closed, Completed
    date_closed = Column(Date, nullable=True)
    remarks = Column(String, nullable=True)
    
    project = relationship("Project", back_populates="matters")

class ProjectTask(Base):
    __tablename__ = "project_tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    task_name = Column(String, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    duration = Column(String, nullable=True) # e.g. "77 days"
    completion_percentage = Column(Integer, default=0)
    completion_date = Column(Date, nullable=True)
    status = Column(String, default="Not Started")
    
    
    # New Fields for Major Upgrade
    # parent_id = Column(Integer, ForeignKey("project_tasks.id"), nullable=True)
    # assigned_to = Column(String, nullable=True) # Staff Name or Email
    # priority = Column(String, default="Medium") # Low, Medium, High
    # description = Column(String, nullable=True) # Rich text description
    # tags = Column(String, nullable=True)
    # order_index = Column(Integer, default=0) # For Kanban ordering
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    # subtasks = relationship("ProjectTask", backref=relationship("ProjectTask", remote_side=[id]))
    # comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")

# class TaskComment(Base):
#     __tablename__ = "task_comments"

#     id = Column(Integer, primary_key=True, index=True)
#     task_id = Column(Integer, ForeignKey("project_tasks.id"), nullable=False)
#     user_name = Column(String, nullable=False) # Who commented
#     content = Column(String, nullable=False)
#     created_at = Column(String, nullable=False) # ISO Format datetime

#     task = relationship("ProjectTask", back_populates="comments")
