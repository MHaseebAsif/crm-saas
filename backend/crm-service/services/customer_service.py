from schemas.customer_schemas import CustReq, BaseRes
from models.customer_models import Customer
import uuid

async def add_cust(req: CustReq, tid: str) -> BaseRes:
    await Customer.create(
        id=uuid.uuid4(),
        tenant_id=tid,
        name=req.name,
        email=req.email,
        status=req.status,
        company=req.company,
        phone=req.phone
    )
    return BaseRes(msg="ok")
