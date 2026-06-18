from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from configs.settings import SETTINGS
from controllers.auth_controller import r as auth_r
from controllers.health_controller import r as hlth_r
from helpers.security_middleware import SecMid

app = FastAPI()
app.add_middleware(SecMid)
app.include_router(auth_r, prefix="/auth")
app.include_router(hlth_r, prefix="/health")

register_tortoise(
    app,
    db_url=SETTINGS.db_url,
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
