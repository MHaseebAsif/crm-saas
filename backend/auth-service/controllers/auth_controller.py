from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from schemas.login_schemas import LoginReq, LoginRes
from schemas.signup_schemas import RegReq
from schemas.auth_schemas import BaseRes, UserRes
from services.login_service import login_user
from services.signup_service import reg_user
from helpers.auth_dependencies import get_usr
from helpers.jwt_helper import dec_tok, gen_tok, gen_ref_tok
from helpers.redis_helper import get_kv, set_kv
from helpers.password_helper import hash_pwd
from models.user_models import User
from models.rbac_models import Role
import uuid

r = APIRouter()

class RefReq(BaseModel):
    refresh_token: str

class ForgotReq(BaseModel):
    email: str

class ResetReq(BaseModel):
    email: str
    token: str
    new_password: str

@r.get("/me", response_model=UserRes)
async def me(u: dict = Depends(get_usr)):
    uid = u.get("sub")
    db_u = await User.get_or_none(id=uid)
    if not db_u:
        raise HTTPException(404, "User not found")
    return UserRes(
        id=str(db_u.id),
        email=db_u.email,
        full_name="",
        role=u.get("role", "employee"),
        tenant_id=str(db_u.tenant_id) if db_u.tenant_id else None,
        is_active=db_u.is_act,
    )

@r.post("/refresh", response_model=LoginRes)
async def refresh(req: RefReq):
    try:
        pay = dec_tok(req.refresh_token)
    except Exception:
        raise HTTPException(401, "Bad ref tok")
    if pay.get("type") != "refresh":
        raise HTTPException(401, "Bad ref tok")
    uid = pay.get("sub")
    stored = await get_kv(f"ref:{uid}")
    if stored != req.refresh_token:
        raise HTTPException(401, "Ref tok revoked")
    db_u = await User.get_or_none(id=uid)
    if not db_u:
        raise HTTPException(401, "User not found")
    role_rec = await Role.get_or_none(id=db_u.role_id)
    r_nm = role_rec.name if role_rec else "employee"
    new_tok = gen_tok(uid, str(db_u.tenant_id), r_nm)
    new_ref = gen_ref_tok(uid)
    await set_kv(f"ref:{uid}", new_ref, 604800)
    return LoginRes(tok=new_tok, ref=new_ref)

@r.post("/login", response_model=LoginRes)
async def login(req: LoginReq):
    return await login_user(req)

@r.post("/reg", response_model=BaseRes)
async def reg(req: RegReq):
    return await reg_user(req)

@r.post("/logout", response_model=BaseRes)
async def logout(u: dict = Depends(get_usr)):
    uid = u.get("sub")
    from configs.redis import r_pool
    await r_pool.delete(f"ref:{uid}")
    return BaseRes(msg="ok")

@r.post("/forgot-password", response_model=BaseRes)
async def forgot_password(req: ForgotReq):
    db_u = await User.get_or_none(email=req.email)
    if not db_u:
        return BaseRes(msg="sent")
    import secrets
    from helpers.email_helper import send_reset_email
    token = secrets.token_urlsafe()
    await set_kv(f"pwd_reset:{token}", str(db_u.id), 3600)
    try:
        await send_reset_email(req.email, token)
    except Exception:
        pass
    return BaseRes(msg="sent")

@r.post("/reset-password", response_model=BaseRes)
async def reset_password(req: ResetReq):
    uid = await get_kv(f"pwd_reset:{req.token}")
    if not uid:
        raise HTTPException(400, "Invalid or expired token")
    db_u = await User.get_or_none(id=uid)
    if not db_u:
        raise HTTPException(400, "User not found")
    db_u.pwd_hash = hash_pwd(req.new_password)
    await db_u.save()
    from configs.redis import r_pool
    await r_pool.delete(f"pwd_reset:{req.token}")
    return BaseRes(msg="done")
