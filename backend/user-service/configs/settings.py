from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    db_url: str
    redis_url: str
    rmq_url: str

    class Config:
        env_file = ".env"

SETTINGS = Settings()
