from pydantic import BaseModel
from typing import Optional

class UserReq(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None

class TenantReq(BaseModel):
    name: str
    domain: str

class BaseRes(BaseModel):
    msg: str
