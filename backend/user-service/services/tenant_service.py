from schemas.user_schemas import TenantReq, BaseRes
from models.user_models import Tenant
import uuid

async def add_tenant(req: TenantReq) -> BaseRes:
    await Tenant.create(
        id=uuid.uuid4(),
        name=req.name,
        domain=req.domain
    )
    return BaseRes(msg="ok")
