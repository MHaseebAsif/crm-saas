from .settings import SETTINGS

TORTOISE_ORM = {
    "connections": {"default": SETTINGS.db_url},
    "apps": {
        "models": {
            "models": ["models", "aerich.models"],
            "default_connection": "default",
        },
    },
}
