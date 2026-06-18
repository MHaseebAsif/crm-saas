from models.rbac_models import Role
import uuid

async def seed():
    tid = uuid.uuid4()
    for r in ["super_admin", "company_admin", "employee"]:
        await Role.create(id=uuid.uuid4(), tenant_id=tid, name=r)
