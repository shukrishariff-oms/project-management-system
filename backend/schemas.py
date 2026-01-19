from pydantic import BaseModel
from typing import Optional
from datetime import date

# User Schemas
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: Optional[str] = "staff"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: Optional[str] = None
    email: str

# Project Health Schemas
class ProjectHealthBase(BaseModel):
    schedule_status: Optional[str] = "Good"
    budget_status: Optional[str] = "Good"
    risk_status: Optional[str] = "Good"
    scope_status: Optional[str] = "Good"
    resource_status: Optional[str] = "Good"

class ProjectHealth(ProjectHealthBase):
    id: int
    project_id: int
    
    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    name: str
    project_code: Optional[str] = None
    project_manager: Optional[str] = None
    assigned_to_email: Optional[str] = None
    description: Optional[str] = None
    objective: Optional[str] = None
    status: Optional[str] = "Not Started"
    priority: Optional[str] = "Medium"
    risk_level: Optional[str] = "Low"
    department: Optional[str] = None
    is_archived: Optional[int] = 0
    tags: Optional[str] = None
    progress_percentage: Optional[int] = 0
    start_date: date
    end_date: date
    planned_cost: float
    actual_cost: Optional[float] = 0.0

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    health: Optional[ProjectHealth] = None
    payments: list['PaymentSchedule'] = []
    tasks: list['ProjectTask'] = []
    
    class Config:
        from_attributes = True

# Payment Schedule Schemas
class PaymentScheduleBase(BaseModel):
    category: Optional[str] = "Project Implementation"
    deliverable: str
    phase: str
    plan_date: date
    planned_amount: float
    paid_amount: Optional[float] = 0.0
    status: Optional[str] = "Not Paid"
    remark: Optional[str] = None
    payment_date: Optional[date] = None
    po_number: Optional[str] = None
    invoice_number: Optional[str] = None
    supporting_document: Optional[str] = None

class PaymentScheduleCreate(PaymentScheduleBase):
    pass

class PaymentScheduleUpdate(BaseModel):
    category: Optional[str] = None
    deliverable: Optional[str] = None
    phase: Optional[str] = None
    plan_date: Optional[date] = None
    planned_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    status: Optional[str] = None
    remark: Optional[str] = None
    payment_date: Optional[date] = None
    po_number: Optional[str] = None
    invoice_number: Optional[str] = None
    supporting_document: Optional[str] = None

class PaymentSchedule(PaymentScheduleBase):
    id: int
    project_id: int
    
    class Config:
        from_attributes = True

# Matters Arising Schemas
class MattersArisingBase(BaseModel):
    issue_description: str
    level: Optional[str] = "MANCOM"
    action_updates: Optional[str] = None
    pic: Optional[str] = None
    target_date: Optional[date] = None
    status: Optional[str] = "Open"
    date_closed: Optional[date] = None
    date_raised: date
    remarks: Optional[str] = None

class MattersArisingCreate(MattersArisingBase):
    pass

class MattersArisingUpdate(BaseModel):
    issue_description: Optional[str] = None
    level: Optional[str] = None
    action_updates: Optional[str] = None
    pic: Optional[str] = None
    target_date: Optional[date] = None
    status: Optional[str] = None
    date_closed: Optional[date] = None
    date_raised: Optional[date] = None
    remarks: Optional[str] = None

class MattersArising(MattersArisingBase):
    id: int
    project_id: int
    
    class Config:
        from_attributes = True

# Task Comment Schemas
class TaskCommentBase(BaseModel):
    content: str
    user_name: str

class TaskCommentCreate(TaskCommentBase):
    pass

class TaskComment(TaskCommentBase):
    id: int
    task_id: int
    created_at: str

    class Config:
        from_attributes = True

# Project Task Schemas
class ProjectTaskBase(BaseModel):
    task_name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration: Optional[str] = None
    completion_percentage: Optional[int] = 0
    completion_date: Optional[date] = None
    status: Optional[str] = "Not Started"
    
    # New Fields
    parent_id: Optional[int] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = "Medium"
    description: Optional[str] = None
    tags: Optional[str] = None
    order_index: Optional[int] = 0

class ProjectTaskCreate(ProjectTaskBase):
    pass

class ProjectTaskUpdate(BaseModel):
    task_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration: Optional[str] = None
    completion_percentage: Optional[int] = None
    completion_date: Optional[date] = None
    status: Optional[str] = None
    parent_id: Optional[int] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    order_index: Optional[int] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    project_code: Optional[str] = None
    project_manager: Optional[str] = None
    assigned_to_email: Optional[str] = None
    description: Optional[str] = None
    objective: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    risk_level: Optional[str] = None
    department: Optional[str] = None
    is_archived: Optional[int] = None
    tags: Optional[str] = None
    progress_percentage: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    planned_cost: Optional[float] = None
    actual_cost: Optional[float] = None

class ProjectTask(ProjectTaskBase):
    id: int
    project_id: int
    subtasks: list['ProjectTask'] = []
    comments: list['TaskComment'] = []
    
    class Config:
        from_attributes = True

# Composite Project Details Schema
class ProjectDetails(Project):
    payments: list[PaymentSchedule] = []
    matters: list[MattersArising] = []
    tasks: list[ProjectTask] = []
    
    class Config:
        from_attributes = True
