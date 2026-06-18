from fastapi import Header, HTTPException
import jwt
from configs.settings import SETTINGS

def get_tnt(auth: str = Header(None)) -> str:
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(401, "No auth")
    tok = auth.split(" ")[1]
    try:
        d = jwt.decode(tok, SETTINGS.pub_key, algorithms=["RS256"])
        return d.get("tid", "")
    except Exception:
        raise HTTPException(401, "Bad tok")
