from tortoise import fields, models

class Activity(models.Model):
    id = fields.UUIDField(pk=True)
    tenant_id = fields.UUIDField(index=True)
    desc = fields.TextField()
