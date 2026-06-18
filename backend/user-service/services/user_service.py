from schemas.user_schemas import UserReq, BaseRes
from models.user_models import UserProfile
import uuid

async def add_user(req: UserReq, tid: str, uid: str) -> BaseRes:
    await UserProfile.create(
        id=uuid.uuid4(),
        tenant_id=tid,
        user_id=uid,
        first_name=req.first_name,
        last_name=req.last_name,
        phone=req.phone
    )
    return BaseRes(msg="ok")
