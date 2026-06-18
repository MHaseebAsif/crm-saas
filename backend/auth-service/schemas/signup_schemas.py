from pydantic import BaseModel

class RegReq(BaseModel):
    email: str
    pwd: str
    tenant_id: str
