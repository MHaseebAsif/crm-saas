from tortoise import fields, models

class UserProfile(models.Model):
    id = fields.UUIDField(pk=True)
    tenant_id = fields.UUIDField(index=True)
    user_id = fields.UUIDField(unique=True)
    first_name = fields.CharField(max_length=100)
    last_name = fields.CharField(max_length=100)
    phone = fields.CharField(max_length=20, null=True)

class Tenant(models.Model):
    id = fields.UUIDField(pk=True)
    name = fields.CharField(max_length=100)
    domain = fields.CharField(max_length=100, unique=True)
