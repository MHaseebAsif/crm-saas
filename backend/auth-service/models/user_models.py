from tortoise import fields, models

class User(models.Model):
    id = fields.UUIDField(pk=True)
    tenant_id = fields.UUIDField(index=True)
    email = fields.CharField(max_length=255, unique=True)
    pwd_hash = fields.CharField(max_length=255)
    is_act = fields.BooleanField(default=True)
    role_id = fields.UUIDField(null=True)

    class Meta:
        table = "users"
