from tortoise import fields, models

class Customer(models.Model):
    id = fields.UUIDField(pk=True)
    tenant_id = fields.UUIDField(index=True)
    name = fields.CharField(max_length=100)
    email = fields.CharField(max_length=100)
