from fastapi import APIRouter, Depends
from schemas.task_schemas import TaskReq
from schemas.customer_schemas import BaseRes
from services.task_service import add_task
from helpers.tenant_guard import get_tnt

r = APIRouter()

@r.post("/", response_model=BaseRes)
async def mk_task(req: TaskReq, tid: str = Depends(get_tnt)):
    return await add_task(req, tid)
