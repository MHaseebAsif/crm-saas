from tortoise import fields, models

class Role(models.Model):
    id = fields.UUIDField(pk=True)
    tenant_id = fields.UUIDField(index=True)
    name = fields.CharField(max_length=50)
