from schemas.notification_schemas import NotifReq
from models.notification_models import Notification
import uuid

async def send_notif(req: NotifReq) -> Notification:
    notif = await Notification.create(
        id=uuid.uuid4(),
        tenant_id=req.tenant_id,
        type=req.type,
        title=req.title,
        message=req.message,
        is_read=False,
        recipient=req.recipient,
        content=req.content,
    )
    return notif
