from tortoise import fields, models

class RevTok(models.Model):
    id = fields.UUIDField(pk=True)
    tenant_id = fields.UUIDField(index=True)
    jti = fields.CharField(max_length=255, unique=True)
    exp_at = fields.DatetimeField()
