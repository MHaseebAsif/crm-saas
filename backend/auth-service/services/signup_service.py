from models.user_models import User
from helpers.password_helper import hash_pwd
from schemas.signup_schemas import RegReq
from schemas.auth_schemas import BaseRes
import uuid

async def reg_user(req: RegReq) -> BaseRes:
    h = hash_pwd(req.pwd)
    u = await User.create(id=uuid.uuid4(), email=req.email, pwd_hash=h, tenant_id=req.tenant_id)
    return BaseRes(msg="ok")
