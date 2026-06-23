from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from configs.settings import SETTINGS
from controllers.customer_controller import r as c_r
from controllers.employee_controller import r as e_r
from controllers.task_controller import r as t_r
from controllers.websocket_controller import r as w_r
from controllers.health_controller import r as h_r

app = FastAPI()
from prometheus_fastapi_instrumentator import Instrumentator
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(c_r, prefix="/customers")
app.include_router(e_r, prefix="/employees")
app.include_router(t_r, prefix="/tasks")
app.include_router(w_r, prefix="/ws")
app.include_router(h_r, prefix="/health")

register_tortoise(
    app,
    db_url=SETTINGS.db_url,
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
