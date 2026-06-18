from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from helpers.websocket_manager import ws_mgr

r = APIRouter()

@r.websocket("/{tid}")
async def ws_ep(ws: WebSocket, tid: str):
    await ws_mgr.conn(ws, tid)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        ws_mgr.disconn(ws, tid)
