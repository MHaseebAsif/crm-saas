from fastapi import Header, HTTPException
import jwt
from configs.settings import SETTINGS

def get_tnt(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "No auth")
    tok = authorization.split(" ")[1]
    try:
        d = jwt.decode(tok, SETTINGS.pub_key, algorithms=["RS256"])
        return d.get("tid", "")
    except Exception:
        raise HTTPException(401, "Bad tok")
