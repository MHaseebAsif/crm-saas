from pydantic import BaseModel

class PwdResetReq(BaseModel):
    email: str

class PwdSetReq(BaseModel):
    code: str
    pwd: str
