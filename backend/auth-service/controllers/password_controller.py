from fastapi import APIRouter
from schemas.password_schemas import PwdResetReq, PwdSetReq
from schemas.auth_schemas import BaseRes
from services.password_service import req_reset, set_pwd

r = APIRouter()

@r.post("/pwd/req", response_model=BaseRes)
async def reset_req(req: PwdResetReq):
    return await req_reset(req)

@r.post("/pwd/set", response_model=BaseRes)
async def reset_set(req: PwdSetReq):
    return await set_pwd(req)
