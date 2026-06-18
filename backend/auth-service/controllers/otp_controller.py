from fastapi import APIRouter
from schemas.otp_schemas import OtpReq
from schemas.auth_schemas import BaseRes
from services.otp_service import ver_otp

r = APIRouter()

@r.post("/otp", response_model=BaseRes)
async def verify(req: OtpReq):
    return await ver_otp(req)
