from schemas.rbac_schemas import RoleReq
from schemas.auth_schemas import BaseRes
from models.rbac_models import Role
import uuid

async def add_role(req: RoleReq) -> BaseRes:
    await Role.create(id=uuid.uuid4(), tenant_id=req.tenant_id, name=req.name)
    return BaseRes(msg="ok")
