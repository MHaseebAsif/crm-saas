from schemas.notification_schemas import NotifReq, BaseRes
from models.notification_models import Notification
import uuid

async def send_notif(req: NotifReq) -> BaseRes:
    await Notification.create(
        id=uuid.uuid4(),
        tenant_id=req.tenant_id,
        type=req.type,
        status="sent",
        recipient=req.recipient,
        content=req.content
    )
    return BaseRes(msg="ok")
