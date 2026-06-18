from fastapi import APIRouter, Depends
from schemas.customer_schemas import CustReq, BaseRes
from services.customer_service import add_cust
from helpers.tenant_guard import get_tnt

r = APIRouter()

@r.post("/", response_model=BaseRes)
async def mk_cust(req: CustReq, tid: str = Depends(get_tnt)):
    return await add_cust(req, tid)
