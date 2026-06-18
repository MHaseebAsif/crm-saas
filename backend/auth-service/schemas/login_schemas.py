from pydantic import BaseModel

class LoginReq(BaseModel):
    email: str
    pwd: str

class LoginRes(BaseModel):
    tok: str
    ref: str
