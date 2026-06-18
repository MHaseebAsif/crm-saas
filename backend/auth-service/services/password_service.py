from schemas.password_schemas import PwdResetReq, PwdSetReq
from schemas.auth_schemas import BaseRes

async def req_reset(req: PwdResetReq) -> BaseRes:
    return BaseRes(msg="sent")

async def set_pwd(req: PwdSetReq) -> BaseRes:
    return BaseRes(msg="done")
