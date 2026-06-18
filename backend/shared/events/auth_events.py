from .base import BaseEvt

class LoginEvt(BaseEvt):
    uid: str
    ip: str

class RegEvt(BaseEvt):
    uid: str
    email: str
