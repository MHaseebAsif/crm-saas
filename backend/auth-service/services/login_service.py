from models.user_models import User
from models.rbac_models import Role
from helpers.password_helper import ver_pwd
from helpers.jwt_helper import gen_tok, gen_ref_tok
from helpers.redis_helper import set_kv
from schemas.login_schemas import LoginReq, LoginRes
from fastapi import HTTPException
import logging

log = logging.getLogger(__name__)

async def login_user(req: LoginReq) -> LoginRes:
    u = await User.get_or_none(email=req.email)
    if not u or not ver_pwd(req.pwd, u.pwd_hash):
        raise HTTPException(401, "Bad creds")
    r = await Role.get_or_none(id=u.role_id)
    r_nm = r.name if r else "employee"
    uid = str(u.id)
    tid = str(u.tenant_id)
    tok = gen_tok(uid, tid, r_nm)
    ref = gen_ref_tok(uid)
    try:
        await set_kv(f"ref:{uid}", ref, 604800)
    except Exception as e:
        log.error("redis set_kv failed uid=%s err=%s", uid, e)
        raise HTTPException(503, "Token store unavailable")
    return LoginRes(tok=tok, ref=ref)
