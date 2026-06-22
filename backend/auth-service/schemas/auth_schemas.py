from pydantic import BaseModel
from typing import Optional

class BaseRes(BaseModel):
    msg: str

class UserRes(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    tenant_id: Optional[str] = None
    is_active: bool = True
    created_at: str = ""
