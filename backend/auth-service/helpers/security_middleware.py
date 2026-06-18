from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

class SecMid(BaseHTTPMiddleware):
    async def dispatch(self, req: Request, call_next):
        res = await call_next(req)
        res.headers["X-Frame-Options"] = "DENY"
        return res
