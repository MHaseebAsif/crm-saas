from pydantic import BaseModel
from typing import Optional

class CustReq(BaseModel):
    name: str
    email: str
    status: str = "lead"
    company: Optional[str] = None
    phone: Optional[str] = None

class BaseRes(BaseModel):
    msg: str
