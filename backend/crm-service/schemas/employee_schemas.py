from pydantic import BaseModel

class EmpReq(BaseModel):
    user_id: str
    name: str
