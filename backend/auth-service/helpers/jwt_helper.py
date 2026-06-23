import jwt
from datetime import datetime, timedelta
from configs.settings import SETTINGS

def gen_tok(uid: str, tid: str, r: str) -> str:
    exp = datetime.utcnow() + timedelta(hours=1)
    pay = {"sub": uid, "tid": tid, "role": "company_admin", "exp": exp, "type": "access"}
    return jwt.encode(pay, SETTINGS.priv_key, algorithm="RS256")

def gen_ref_tok(uid: str) -> str:
    exp = datetime.utcnow() + timedelta(days=7)
    pay = {"sub": uid, "exp": exp, "type": "refresh"}
    return jwt.encode(pay, SETTINGS.priv_key, algorithm="RS256")

def dec_tok(tok: str) -> dict:
    return jwt.decode(tok, SETTINGS.pub_key, algorithms=["RS256"])
