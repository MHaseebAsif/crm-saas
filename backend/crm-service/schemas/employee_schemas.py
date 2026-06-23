from pydantic import BaseModel

class EmpReq(BaseModel):
    name: str
    email: str
    role: str
