from models.user_models import User
from helpers.password_helper import hash_pwd
from schemas.signup_schemas import RegReq
from schemas.auth_schemas import BaseRes
from helpers.event_publisher import pub_evt
import uuid

async def reg_user(req: RegReq) -> BaseRes:
    h = hash_pwd(req.password)
    t_id = uuid.uuid4()
    u = await User.create(id=uuid.uuid4(), email=req.email, pwd_hash=h, tenant_id=t_id, role="company_admin")
    await pub_evt("auth_events", "user.signup", {"email": req.email, "id": str(u.id), "tenant_id": str(t_id)})
    return BaseRes(msg="ok")
