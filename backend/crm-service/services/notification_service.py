from helpers.websocket_manager import ws_mgr

async def notify(msg: str, tid: str):
    await ws_mgr.bcast(msg, tid)
