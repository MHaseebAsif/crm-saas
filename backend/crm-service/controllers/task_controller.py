import math
from fastapi import APIRouter, Depends
from schemas.task_schemas import TaskCreate, TaskReq, TaskListRes
from schemas.customer_schemas import BaseRes
from services.task_service import add_task
from helpers.tenant_guard import get_tnt
from models.task_models import Task

r = APIRouter()

@r.get("", response_model=TaskListRes)
async def list_tasks(page: int = 1, size: int = 10, tid: str = Depends(get_tnt)):
    total = await Task.filter(tenant_id=tid).count()
    tasks = await Task.filter(tenant_id=tid).offset((page - 1) * size).limit(size)
    items = []
    for t in tasks:
        items.append({
            "id": str(t.id),
            "tenant_id": str(t.tenant_id),
            "title": t.title,
            "description": None,
            "status": t.status,
            "priority": "medium",
            "assigned_to": str(t.assigned_to) if t.assigned_to else None,
            "assigned_to_name": None,
            "customer_id": None,
            "customer_name": None,
            "due_date": None,
            "created_at": "",
            "updated_at": "",
        })
    pages = math.ceil(total / size) if size > 0 else 0
    return {"items": items, "total": total, "page": page, "size": size, "pages": pages}

@r.post("", response_model=BaseRes)
async def mk_task(req: TaskCreate, tid: str = Depends(get_tnt)):
    return await add_task(req, tid)

from pydantic import BaseModel
from typing import Optional
class TaskPatchReq(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None

@r.patch("/{tid_param}")
async def patch_task(tid_param: str, req: TaskPatchReq, tid: str = Depends(get_tnt)):
    from fastapi import HTTPException
    t = await Task.get_or_none(id=tid_param, tenant_id=tid)
    if not t:
        raise HTTPException(404, "Not found")
    if req.title is not None:
        t.title = req.title
    if req.status is not None:
        t.status = req.status
    if req.assigned_to is not None:
        t.assigned_to = req.assigned_to
    await t.save()
    return {
        "id": str(t.id),
        "tenant_id": str(t.tenant_id),
        "title": t.title,
        "description": req.description,
        "status": t.status,
        "priority": req.priority or "medium",
        "assigned_to": str(t.assigned_to) if t.assigned_to else None,
        "assigned_to_name": None,
        "customer_id": None,
        "customer_name": None,
        "due_date": req.due_date,
        "created_at": "",
        "updated_at": "",
    }

@r.delete("/{tid_param}", response_model=BaseRes)
async def del_task(tid_param: str, tid: str = Depends(get_tnt)):
    from fastapi import HTTPException
    t = await Task.get_or_none(id=tid_param, tenant_id=tid)
    if not t:
        raise HTTPException(404, "Not found")
    await t.delete()
    return BaseRes(msg="deleted")
