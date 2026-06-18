from pydantic import BaseModel

class TokRefReq(BaseModel):
    ref: str
