from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    db_url: str = "postgres://admin:securepass@postgresql:5432/crm_db"
    redis_url: str = "redis://redis:6379/0"
    rmq_url: str = "amqp://guest:guest@rabbitmq:5672/"
    pub_key: str = ""

    class Config:
        env_file = ".env"

SETTINGS = Settings()
