from pydantic import BaseModel
from datetime import datetime

class BaseEvt(BaseModel):
    evt_id: str
    ts: datetime = datetime.utcnow()
    src: str
