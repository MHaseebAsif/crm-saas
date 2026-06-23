from schemas.task_schemas import TaskCreate
from schemas.customer_schemas import BaseRes
from models.task_models import Task
import uuid
import json
import aio_pika
from configs.rabbitmq import get_rmq

async def add_task(data: TaskCreate, tid: str) -> BaseRes:
    task = await Task.create(
        id=uuid.uuid4(),
        tenant_id=tid,
        title=data.title,
        description=data.description,
        due_date=data.due_date,
        assigned_to=data.assigned_to,
        priority=data.priority,
        status="pending"
    )
    c = await get_rmq()
    ch = await c.channel()
    ex = await ch.declare_exchange("auth_events", aio_pika.ExchangeType.TOPIC)
    b = {"id": str(task.id), "tenant_id": str(tid), "email": "", "message": f"New task assigned: {data.title}"}
    m = aio_pika.Message(body=json.dumps(b).encode())
    await ex.publish(m, routing_key="user.signup")
    return BaseRes(msg="ok")
