from pydantic import BaseModel

class TaskReq(BaseModel):
    title: str
    status: str
    assigned_to: str | None = None
