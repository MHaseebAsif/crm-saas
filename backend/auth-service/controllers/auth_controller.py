from fastapi import APIRouter, Depends
from schemas.login_schemas import LoginReq, LoginRes
from schemas.signup_schemas import RegReq
from schemas.auth_schemas import BaseRes
from services.login_service import login_user
from services.signup_service import reg_user

r = APIRouter()

@r.post("/login", response_model=LoginRes)
async def login(req: LoginReq):
    return await login_user(req)

@r.post("/reg", response_model=BaseRes)
async def reg(req: RegReq):
    return await reg_user(req)
