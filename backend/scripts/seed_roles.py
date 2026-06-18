import asyncio
from tortoise import Tortoise
import uuid
import os

DB_URL = os.environ.get("DB_URL", "postgres://admin:pass@localhost:5432/auth_db")

ROLES = ["super_admin", "company_admin", "employee"]
TENANT_ID = str(uuid.uuid4())

async def seed():
    await Tortoise.init(
        db_url=DB_URL,
        modules={"models": ["aerich.models"]}
    )
    from models.rbac_models import Role
    for r in ROLES:
        await Role.create(id=uuid.uuid4(), tenant_id=TENANT_ID, name=r)
    await Tortoise.close_connections()

asyncio.run(seed())
