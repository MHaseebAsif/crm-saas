from fastapi import WebSocket

class WsMgr:
    def __init__(self):
        self.cons: dict[str, list[WebSocket]] = {}

    async def conn(self, ws: WebSocket, tid: str):
        await ws.accept()
        if tid not in self.cons:
            self.cons[tid] = []
        self.cons[tid].append(ws)

    def disconn(self, ws: WebSocket, tid: str):
        if tid in self.cons and ws in self.cons[tid]:
            self.cons[tid].remove(ws)

    async def bcast(self, msg: str, tid: str):
        if tid in self.cons:
            for w in self.cons[tid]:
                await w.send_text(msg)

ws_mgr = WsMgr()
