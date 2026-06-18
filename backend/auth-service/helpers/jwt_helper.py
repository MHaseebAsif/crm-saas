import jwt
from datetime import datetime, timedelta
from configs.settings import SETTINGS

def gen_tok(uid: str, tid: str, r: str) -> str:
    exp = datetime.utcnow() + timedelta(hours=1)
    pay = {"sub": uid, "tid": tid, "role": r, "exp": exp}
    return jwt.encode(pay, SETTINGS.priv_key, algorithm="RS256")

def dec_tok(tok: str) -> dict:
    return jwt.decode(tok, SETTINGS.pub_key, algorithms=["RS256"])
