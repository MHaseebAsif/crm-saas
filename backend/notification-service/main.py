from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from configs.settings import SETTINGS
from controllers.notification_controller import r as n_r
from controllers.health_controller import r as h_r

app = FastAPI()
app.include_router(n_r, prefix="/notifications")
app.include_router(h_r, prefix="/health")

register_tortoise(
    app,
    db_url=SETTINGS.db_url,
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
