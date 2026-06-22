from pydantic import BaseModel
from typing import Optional

class RegReq(BaseModel):
    email: str
    password: str
    full_name: str
    tenant_name: Optional[str] = None
