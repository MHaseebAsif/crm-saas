from pydantic import BaseModel

class NotifReq(BaseModel):
    tenant_id: str
    type: str
    recipient: str
    content: str

class BaseRes(BaseModel):
    msg: str
