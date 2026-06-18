from schemas.task_schemas import TaskReq
from schemas.customer_schemas import BaseRes
from models.task_models import Task
import uuid

async def add_task(req: TaskReq, tid: str) -> BaseRes:
    await Task.create(id=uuid.uuid4(), tenant_id=tid, title=req.title, status=req.status, assigned_to=req.assigned_to)
    return BaseRes(msg="ok")
