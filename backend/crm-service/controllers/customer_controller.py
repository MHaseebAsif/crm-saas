import math
from fastapi import APIRouter, Depends, Query
from typing import Optional
from schemas.customer_schemas import CustReq, BaseRes
from services.customer_service import add_cust
from helpers.tenant_guard import get_tnt
from models.customer_models import Customer

r = APIRouter()

@r.get("")
async def list_custs(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    tid: str = Depends(get_tnt),
):
    qs = Customer.filter(tenant_id=tid)
    if search:
        qs = qs.filter(name__icontains=search)
    total = await qs.count()
    rows = await qs.offset((page - 1) * size).limit(size)
    items = [
        {
            "id": str(c.id),
            "tenant_id": str(c.tenant_id),
            "name": c.name,
            "email": c.email,
            "phone": None,
            "company": None,
            "status": "lead",
            "notes": None,
            "created_at": "",
            "updated_at": "",
        }
        for c in rows
    ]
    return {"items": items, "total": total, "page": page, "size": size, "pages": math.ceil(total / size) if size > 0 else 0}

@r.post("", response_model=BaseRes)
async def mk_cust(req: CustReq, tid: str = Depends(get_tnt)):
    return await add_cust(req, tid)

from pydantic import BaseModel
class CustPatchReq(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None

@r.patch("/{cid}")
async def patch_cust(cid: str, req: CustPatchReq, tid: str = Depends(get_tnt)):
    from fastapi import HTTPException
    c = await Customer.get_or_none(id=cid, tenant_id=tid)
    if not c:
        raise HTTPException(404, "Not found")
    if req.name is not None:
        c.name = req.name
    if req.email is not None:
        c.email = req.email
    await c.save()
    return {
        "id": str(c.id),
        "tenant_id": str(c.tenant_id),
        "name": c.name,
        "email": c.email,
        "phone": req.phone,
        "company": None,
        "status": req.status or "lead",
        "notes": None,
        "created_at": "",
        "updated_at": "",
    }

@r.delete("/{cid}", response_model=BaseRes)
async def del_cust(cid: str, tid: str = Depends(get_tnt)):
    from fastapi import HTTPException
    c = await Customer.get_or_none(id=cid, tenant_id=tid)
    if not c:
        raise HTTPException(404, "Not found")
    await c.delete()
    return BaseRes(msg="deleted")
