from schemas.employee_schemas import EmpReq
from schemas.customer_schemas import BaseRes
from models.employee_models import Employee
import uuid

async def add_emp(req: EmpReq, tid: str) -> BaseRes:
    await Employee.create(id=uuid.uuid4(), tenant_id=tid, user_id=req.user_id, name=req.name)
    return BaseRes(msg="ok")
