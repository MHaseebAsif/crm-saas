from helpers.event_consumer import cons_evt
from helpers.email_helper import send_mail
from models.notification_models import Notification
import json
import uuid

async def proc_msg(b: bytes):
    d = json.loads(b)
    email = d.get("email", "")
    uid = d.get("id", "")
    tid = d.get("tenant_id", uid)
    content = d.get("message", "New notification")
    await Notification.create(
        id=uuid.uuid4(),
        tenant_id=tid,
        type="task_assigned",
        is_read=False,
        recipient=email,
        content=content,
    )
    try:
        await send_mail(email, "Welcome", "Your account has been created.")
    except Exception:
        pass

async def start_cons():
    try:
        print("Starting RabbitMQ consumer...")
        from configs.rabbitmq import get_rmq
        conn = await get_rmq()
        print("Connected to RabbitMQ")
        await cons_evt("notif_q", "auth_events", "user.signup", proc_msg)
    except Exception as e:
        print(f"RabbitMQ consumer error: {e}")
