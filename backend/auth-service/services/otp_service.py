from schemas.otp_schemas import OtpReq
from schemas.auth_schemas import BaseRes
from models.otp_models import Otp

async def ver_otp(req: OtpReq) -> BaseRes:
    o = await Otp.get_or_none(user_id=req.uid, code=req.code)
    if not o:
        return BaseRes(msg="bad")
    return BaseRes(msg="ok")
