import math
import json
import uuid
from fastapi import APIRouter, HTTPException, Query, Header, Depends, WebSocket, WebSocketDisconnect
from schemas.notification_schemas import NotifReq, BaseRes
from services.notification_service import send_notif
from models.notification_models import Notification
from configs.settings import SETTINGS

r = APIRouter()

connected: dict[str, list[WebSocket]] = {}

async def broadcast(tenant_id: str, payload: dict) -> None:
    sockets = connected.get(str(tenant_id), [])
    dead = []
    for ws in sockets:
        try:
            await ws.send_text(json.dumps(payload))
        except Exception:
            dead.append(ws)
    for ws in dead:
        sockets.remove(ws)

def get_tnt(x_tenant_id: str = Header(None)) -> str:
    if not x_tenant_id:
        raise HTTPException(401, "No tenant")
    return x_tenant_id

@r.websocket("/ws/{tenant_id}")
async def ws_notifications(websocket: WebSocket, tenant_id: str):
    await websocket.accept()
    connected.setdefault(tenant_id, []).append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        sockets = connected.get(tenant_id, [])
        if websocket in sockets:
            sockets.remove(websocket)

@r.get("/")
async def list_notifs(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    tid: str = Depends(get_tnt),
):
    total = await Notification.filter(tenant_id=tid).count()
    rows = await Notification.filter(tenant_id=tid).order_by("-created_at").offset((page - 1) * size).limit(size)
    items = [
        {
            "id": str(n.id),
            "tenant_id": str(n.tenant_id),
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "recipient": n.recipient,
            "content": n.content,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in rows
    ]
    return {"items": items, "total": total, "page": page, "size": size, "pages": math.ceil(total / size) if size > 0 else 0}

@r.post("/", response_model=BaseRes)
async def send_n(req: NotifReq):
    notif = await send_notif(req)
    await broadcast(str(req.tenant_id), {
        "id": str(notif.id),
        "type": notif.type,
        "title": notif.title,
        "message": notif.message,
        "is_read": False,
        "created_at": notif.created_at.isoformat() if notif.created_at else None,
    })
    return BaseRes(msg="ok")

@r.patch("/{nid}/read", response_model=BaseRes)
async def mark_read(nid: str):
    n = await Notification.get_or_none(id=nid)
    if not n:
        raise HTTPException(404, "Not found")
    n.is_read = True
    await n.save()
    return BaseRes(msg="ok")

@r.post("/read-all", response_model=BaseRes)
async def mark_all_read(tid: str = Depends(get_tnt)):
    await Notification.filter(tenant_id=tid, is_read=False).update(is_read=True)
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
