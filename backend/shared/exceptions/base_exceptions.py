class BaseExc(Exception):
    def __init__(self, msg: str, code: int):
        self.msg = msg
        self.code = code
        super().__init__(self.msg)

class AuthExc(BaseExc):
    def __init__(self, msg: str = "Auth Err", code: int = 401):
        super().__init__(msg, code)

class ValExc(BaseExc):
    def __init__(self, msg: str = "Val Err", code: int = 400):
        super().__init__(msg, code)

class NotFndExc(BaseExc):
    def __init__(self, msg: str = "Not Fnd", code: int = 404):
        super().__init__(msg, code)
