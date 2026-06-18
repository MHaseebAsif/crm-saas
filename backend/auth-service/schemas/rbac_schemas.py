from pydantic import BaseModel

class RoleReq(BaseModel):
    name: str
    tenant_id: str
