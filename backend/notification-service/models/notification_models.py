from tortoise import fields, models

class Notification(models.Model):
    id = fields.UUIDField(pk=True)
    tenant_id = fields.UUIDField(index=True)
    type = fields.CharField(max_length=50)
    is_read = fields.BooleanField(default=False)
    recipient = fields.CharField(max_length=255)
    message = fields.TextField()
