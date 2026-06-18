from fastapi import APIRouter

r = APIRouter()

@r.get("/")
async def hlth():
    return {"sts": "ok"}
