import math
from fastapi import APIRouter, Depends, Query
from typing import Optional
from schemas.employee_schemas import EmpReq
from schemas.customer_schemas import BaseRes
from services.employee_service import add_emp
from helpers.tenant_guard import get_tnt
from models.employee_models import Employee

r = APIRouter()

@r.get("")
async def list_emps(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    tid: str = Depends(get_tnt),
):
    qs = Employee.filter(tenant_id=tid)
    if search:
        qs = qs.filter(name__icontains=search)
    total = await qs.count()
    rows = await qs.offset((page - 1) * size).limit(size)
    items = [
        {
            "id": str(e.id),
            "tenant_id": str(e.tenant_id),
            "name": e.name,
            "email": e.email,
            "role": e.role,
        }
        for e in rows
    ]
    return {"items": items, "total": total, "page": page, "size": size, "pages": math.ceil(total / size) if size > 0 else 0}

@r.post("", response_model=BaseRes)
async def mk_emp(req: EmpReq, tid: str = Depends(get_tnt)):
    return await add_emp(req, tid)

from pydantic import BaseModel
class EmpPatchReq(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

@r.patch("/{eid}")
async def patch_emp(eid: str, req: EmpPatchReq, tid: str = Depends(get_tnt)):
    from fastapi import HTTPException
    e = await Employee.get_or_none(id=eid, tenant_id=tid)
    if not e:
        raise HTTPException(404, "Not found")
    if req.name is not None:
        e.name = req.name
    if req.email is not None:
        e.email = req.email
    if req.role is not None:
        e.role = req.role
    await e.save()
    return {
        "id": str(e.id),
        "tenant_id": str(e.tenant_id),
        "name": e.name,
        "email": e.email,
        "role": e.role,
    }

@r.delete("/{eid}", response_model=BaseRes)
async def del_emp(eid: str, tid: str = Depends(get_tnt)):
    from fastapi import HTTPException
    e = await Employee.get_or_none(id=eid, tenant_id=tid)
    if not e:
        raise HTTPException(404, "Not found")
    await e.delete()
    return BaseRes(msg="deleted")
