from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from configs.settings import SETTINGS
from controllers.notification_controller import r as n_r
from controllers.health_controller import r as h_r
from services.event_handler_service import start_cons
import asyncio

app = FastAPI()
from prometheus_fastapi_instrumentator import Instrumentator
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(n_r, prefix="/notifications")
app.include_router(h_r, prefix="/health")

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
