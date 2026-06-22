import math
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from schemas.user_schemas import TenantReq, BaseRes
from services.tenant_service import add_tenant
from models.user_models import Tenant

r = APIRouter()

@r.get("/")
async def list_tenants(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
):
    qs = Tenant.all()
    if search:
        qs = qs.filter(name__icontains=search)
    total = await qs.count()
    rows = await qs.offset((page - 1) * size).limit(size)
    items = [
        {
            "id": str(t.id),
            "name": t.name,
            "slug": t.domain,
            "is_active": True,
            "owner_email": "",
            "created_at": "",
            "updated_at": "",
        }
        for t in rows
    ]
    return {"items": items, "total": total, "page": page, "size": size, "pages": math.ceil(total / size) if size > 0 else 0}

@r.get("/{tid}")
async def get_tenant(tid: str):
    t = await Tenant.get_or_none(id=tid)
    if not t:
        raise HTTPException(404, "Tenant not found")
    return {
        "id": str(t.id),
        "name": t.name,
        "slug": t.domain,
        "is_active": True,
        "owner_email": "",
        "created_at": "",
        "updated_at": "",
    }

@r.post("/", response_model=BaseRes)
async def mk_tenant(req: TenantReq):
    return await add_tenant(req)
