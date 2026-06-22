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
    await Notification.create(
        id=uuid.uuid4(),
        tenant_id=tid,
        type="Welcome",
        status="sent",
        recipient=email,
        content="Your account has been created.",
    )
    try:
        await send_mail(email, "Welcome", "Your account has been created.")
    except Exception:
        pass

async def start_cons():
    await cons_evt("notif_q", "auth_events", "user.signup", proc_msg)
