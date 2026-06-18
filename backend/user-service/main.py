from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from configs.settings import SETTINGS
from controllers.user_controller import r as usr_r
from controllers.tenant_controller import r as tnt_r
from controllers.health_controller import r as hlth_r

app = FastAPI()
app.include_router(usr_r, prefix="/users")
app.include_router(tnt_r, prefix="/tenants")
app.include_router(hlth_r, prefix="/health")

register_tortoise(
    app,
    db_url=SETTINGS.db_url,
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
