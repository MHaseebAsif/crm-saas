from schemas.activity_schemas import ActReq
from schemas.customer_schemas import BaseRes
from models.activity_models import Activity
import uuid

async def add_act(req: ActReq, tid: str) -> BaseRes:
    await Activity.create(id=uuid.uuid4(), tenant_id=tid, desc=req.desc)
    return BaseRes(msg="ok")
