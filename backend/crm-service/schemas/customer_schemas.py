from pydantic import BaseModel

class CustReq(BaseModel):
    name: str
    email: str

class BaseRes(BaseModel):
    msg: str
