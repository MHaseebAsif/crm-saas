from fastapi import APIRouter
from schemas.user_schemas import TenantReq, BaseRes
from services.tenant_service import add_tenant

r = APIRouter()

@r.post("/", response_model=BaseRes)
async def mk_tenant(req: TenantReq):
    return await add_tenant(req)
