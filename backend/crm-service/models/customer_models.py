from tortoise import fields, models

class Customer(models.Model):
    id = fields.UUIDField(pk=True)
    tenant_id = fields.UUIDField(index=True)
    name = fields.CharField(max_length=100)
    email = fields.CharField(max_length=100)
    status = fields.CharField(max_length=50, default="lead")
    company = fields.CharField(max_length=255, null=True)
    phone = fields.CharField(max_length=50, null=True)
    created_at = fields.DatetimeField(auto_now_add=True, null=True)
    updated_at = fields.DatetimeField(auto_now=True, null=True)
