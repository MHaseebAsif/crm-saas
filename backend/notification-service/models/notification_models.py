from tortoise import fields, models

class Notification(models.Model):
    id = fields.UUIDField(pk=True)
    tenant_id = fields.UUIDField(index=True)
    type = fields.CharField(max_length=50)
    title = fields.CharField(max_length=255, default="")
    message = fields.TextField(default="")
    is_read = fields.BooleanField(default=False)
    recipient = fields.CharField(max_length=255)
    content = fields.TextField()
    created_at = fields.DatetimeField(auto_now_add=True)
