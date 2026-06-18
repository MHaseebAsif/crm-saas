from tortoise import fields, models

class Task(models.Model):
    id = fields.UUIDField(pk=True)
    tenant_id = fields.UUIDField(index=True)
    title = fields.CharField(max_length=100)
    status = fields.CharField(max_length=20)
    assigned_to = fields.UUIDField(null=True)
