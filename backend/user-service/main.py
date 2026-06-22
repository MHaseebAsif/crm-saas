from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from configs.settings import SETTINGS
from controllers.user_controller import r as usr_r
from controllers.tenant_controller import r as tnt_r
from controllers.health_controller import r as hlth_r
from services.event_consumer_service import start_cons
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(usr_r, prefix="/users")
app.include_router(tnt_r, prefix="/tenants")
app.include_router(hlth_r, prefix="/health")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(start_cons())

register_tortoise(
    app,
    db_url=SETTINGS.db_url,
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
