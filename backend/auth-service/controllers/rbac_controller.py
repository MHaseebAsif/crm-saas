from fastapi import APIRouter, Depends
from schemas.rbac_schemas import RoleReq
from schemas.auth_schemas import BaseRes
from services.rbac_service import add_role
from helpers.auth_dependencies import req_role

r = APIRouter()

@r.post("/role", response_model=BaseRes)
async def mk_role(req: RoleReq, u: dict = Depends(req_role("super_admin"))):
    return await add_role(req)
