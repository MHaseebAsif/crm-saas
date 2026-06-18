from .base import BaseEvt

class LeadEvt(BaseEvt):
    lid: str
    uid: str
    status: str

class ContactEvt(BaseEvt):
    cid: str
    uid: str
