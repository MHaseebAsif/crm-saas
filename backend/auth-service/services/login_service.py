from models.user_models import User
from models.rbac_models import Role
from helpers.password_helper import ver_pwd
from helpers.jwt_helper import gen_tok
from schemas.login_schemas import LoginReq, LoginRes
from fastapi import HTTPException

async def login_user(req: LoginReq) -> LoginRes:
    u = await User.get_or_none(email=req.email)
    if not u or not ver_pwd(req.pwd, u.pwd_hash):
        raise HTTPException(401, "Bad creds")
    r = await Role.get_or_none(id=u.role_id)
    r_nm = r.name if r else "employee"
    tok = gen_tok(str(u.id), str(u.tenant_id), r_nm)
    return LoginRes(tok=tok, ref="todo")
