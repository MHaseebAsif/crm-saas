from .base import BaseEvt

class EmailEvt(BaseEvt):
    to: str
    subj: str
    body: str

class SmsEvt(BaseEvt):
    to: str
    msg: str
