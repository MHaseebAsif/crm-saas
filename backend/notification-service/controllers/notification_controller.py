from fastapi import APIRouter
from schemas.notification_schemas import NotifReq, BaseRes
from services.notification_service import send_notif

r = APIRouter()

@r.post("/", response_model=BaseRes)
async def send_n(req: NotifReq):
    return await send_notif(req)
