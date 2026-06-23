from schemas.task_schemas import TaskCreate
from schemas.customer_schemas import BaseRes
from models.task_models import Task
import uuid

async def add_task(req: TaskCreate, tid: str) -> BaseRes:
    await Task.create(
        id=uuid.uuid4(),
        tenant_id=tid,
        title=req.title,
        description=req.description,
        due_date=req.due_date,
        assigned_to=req.assigned_to,
        priority=req.priority,
        status="pending"
    )
    return BaseRes(msg="ok")
