from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from models.user_models import UserProfile

r = APIRouter()

class ProfilePatch(BaseModel):
    full_name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

@r.get("/me")
async def get_me(uid: str = Query(...)):
    p = await UserProfile.get_or_none(user_id=uid)
    if not p:
        raise HTTPException(404, "Profile not found")
    return {
        "id": str(p.user_id),
        "email": "",
        "full_name": f"{p.first_name} {p.last_name}".strip(),
        "role": "employee",
        "tenant_id": str(p.tenant_id),
        "is_active": True,
        "created_at": "",
    }

@r.patch("/me")
async def patch_me(body: ProfilePatch, uid: str = Query(...)):
    p = await UserProfile.get_or_none(user_id=uid)
    if not p:
        raise HTTPException(404, "Profile not found")
    if body.full_name is not None:
        parts = body.full_name.strip().split(" ", 1)
        p.first_name = parts[0]
        p.last_name = parts[1] if len(parts) > 1 else ""
        await p.save()
    return {
        "id": str(p.user_id),
        "email": "",
        "full_name": f"{p.first_name} {p.last_name}".strip(),
        "role": "employee",
        "tenant_id": str(p.tenant_id),
        "is_active": True,
        "created_at": "",
    }
