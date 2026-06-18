from .base import BaseEvt

class UserUpdEvt(BaseEvt):
    uid: str
    data: dict

class UserDelEvt(BaseEvt):
    uid: str
