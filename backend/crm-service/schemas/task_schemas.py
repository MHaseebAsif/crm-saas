from pydantic import BaseModel
from typing import List, Any, Optional

class TaskReq(BaseModel):
    title: str
    status: str
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None
    description: Optional[str] = None

from datetime import date

class TaskCreate(BaseModel):
    title: str
    description: str
    due_date: date
    assigned_to: Optional[str] = None

class TaskItem(BaseModel):
    id: str
    tenant_id: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str = "medium"
    assigned_to: Optional[str] = None
    assigned_to_name: Optional[str] = None
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    due_date: Optional[str] = None
    created_at: str = "2024-01-01T00:00:00Z"
    updated_at: str = "2024-01-01T00:00:00Z"

class TaskListRes(BaseModel):
    items: List[TaskItem]
    total: int
    page: int
    size: int
    pages: int
