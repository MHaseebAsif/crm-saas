from .settings import SETTINGS

TORTOISE_ORM = {
    "connections": {"default": SETTINGS.db_url},
    "apps": {
        "models": {
            "models": [
                "models.user_models",
                "models.rbac_models",
                "models.token_models",
                "aerich.models"
            ],
            "default_connection": "default",
        },
    },
}
