import math
from fastapi import APIRouter, HTTPException, Query
from schemas.notification_schemas import NotifReq, BaseRes
from services.notification_service import send_notif
from models.notification_models import Notification

r = APIRouter()

@r.get("/")
async def list_notifs(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    tid: str = Query(...),
):
    total = await Notification.filter(tenant_id=tid).count()
    rows = await Notification.filter(tenant_id=tid).offset((page - 1) * size).limit(size)
    items = [
        {
            "id": str(n.id),
            "user_id": n.recipient,
            "title": n.type,
            "message": n.content,
            "is_read": n.status == "read",
            "created_at": "",
        }
        for n in rows
    ]
    return {"items": items, "total": total, "page": page, "size": size, "pages": math.ceil(total / size) if size > 0 else 0}

@r.post("/", response_model=BaseRes)
async def send_n(req: NotifReq):
    return await send_notif(req)

@r.patch("/{nid}/read", response_model=BaseRes)
async def mark_read(nid: str):
    n = await Notification.get_or_none(id=nid)
    if not n:
        raise HTTPException(404, "Not found")
    n.status = "read"
    await n.save()
    return BaseRes(msg="ok")

@r.post("/read-all", response_model=BaseRes)
async def mark_all_read(tid: str = Query(...)):
    await Notification.filter(tenant_id=tid, status="sent").update(status="read")
    return BaseRes(msg="ok")

@r.delete("/{nid}", response_model=BaseRes)
async def delete_notif(nid: str):
    n = await Notification.get_or_none(id=nid)
    if not n:
        raise HTTPException(404, "Not found")
    await n.delete()
    return BaseRes(msg="ok")

@r.delete("/", response_model=BaseRes)
async def delete_all_notifs(tid: str = Query(...)):
    await Notification.filter(tenant_id=tid).delete()
    return BaseRes(msg="deleted")
