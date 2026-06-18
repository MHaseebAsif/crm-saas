from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    db_url: str
    redis_url: str
    rmq_url: str
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_pass: str

    class Config:
        env_file = ".env"

SETTINGS = Settings()
