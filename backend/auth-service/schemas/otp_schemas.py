from pydantic import BaseModel

class OtpReq(BaseModel):
    uid: str
    code: str
