from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_pwd(pwd: str) -> str:
    return pwd_ctx.hash(pwd)

def ver_pwd(pwd: str, hsh: str) -> bool:
    return pwd_ctx.verify(pwd, hsh)
