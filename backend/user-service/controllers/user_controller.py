from fastapi import APIRouter
from schemas.user_schemas import UserReq, BaseRes
from services.user_service import add_user

r = APIRouter()

@r.post("/", response_model=BaseRes)
async def mk_user(req: UserReq, tid: str, uid: str):
    return await add_user(req, tid, uid)
