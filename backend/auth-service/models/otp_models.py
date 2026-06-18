from tortoise import fields, models

class Otp(models.Model):
    id = fields.UUIDField(pk=True)
    tenant_id = fields.UUIDField(index=True)
    user_id = fields.UUIDField()
    code = fields.CharField(max_length=10)
    exp_at = fields.DatetimeField()
