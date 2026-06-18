from pydantic import BaseModel

class ActReq(BaseModel):
    desc: str
