from tortoise import fields, models

class Employee(models.Model):
    id = fields.UUIDField(pk=True)
    tenant_id = fields.UUIDField(index=True)
    user_id = fields.UUIDField()
    name = fields.CharField(max_length=100)
