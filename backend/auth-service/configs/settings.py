from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    db_url: str = "postgres://admin:securepass@postgresql:5432/auth_db"
    redis_url: str = "redis://redis:6379/0"
    rmq_url: str = "amqp://guest:guest@rabbitmq:5672/"
    priv_key: str = ""
    pub_key: str = ""
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 465
    smtp_user: str = ""
    smtp_pass: str = ""

    class Config:
        env_file = ".env"

SETTINGS = Settings()
SETTINGS.priv_key = SETTINGS.priv_key.replace("\\n", "\n")
SETTINGS.pub_key = SETTINGS.pub_key.replace("\\n", "\n")
