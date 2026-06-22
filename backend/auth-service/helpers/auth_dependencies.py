from fastapi import Depends, HTTPException, Header
from .jwt_helper import dec_tok
from .rbac_helper import check_role

def get_tok(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "No auth")
    return authorization.split(" ")[1]

def get_usr(tok: str = Depends(get_tok)) -> dict:
    try:
        return dec_tok(tok)
    except Exception:
        raise HTTPException(401, "Bad tok")

def req_role(r: str):
    def chk(u: dict = Depends(get_usr)):
        if not check_role(u.get("role", ""), r):
            raise HTTPException(403, "No perm")
        return u
    return chk
