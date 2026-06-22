from helpers.event_consumer import cons_evt
from models.user_models import UserProfile
import json
import uuid

async def proc_msg(b: bytes):
    d = json.loads(b)
    uid = d.get("id", "")
    email = d.get("email", "")
    tid = d.get("tenant_id", uid)
    existing = await UserProfile.get_or_none(user_id=uid)
    if existing:
        return
    name_parts = email.split("@")[0].split(".", 1)
    first = name_parts[0] if name_parts else email
    last = name_parts[1] if len(name_parts) > 1 else ""
    await UserProfile.create(
        id=uuid.uuid4(),
        tenant_id=tid,
        user_id=uid,
        first_name=first,
        last_name=last,
        phone=None,
    )

async def start_cons():
    await cons_evt("user_q", proc_msg)
