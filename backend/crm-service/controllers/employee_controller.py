from fastapi import APIRouter, Depends
from schemas.employee_schemas import EmpReq
from schemas.customer_schemas import BaseRes
from services.employee_service import add_emp
from helpers.tenant_guard import get_tnt

r = APIRouter()

@r.post("/", response_model=BaseRes)
async def mk_emp(req: EmpReq, tid: str = Depends(get_tnt)):
    return await add_emp(req, tid)
