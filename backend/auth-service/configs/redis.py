import redis.asyncio as redis
from .settings import SETTINGS

r_pool = redis.from_url(SETTINGS.redis_url, decode_responses=True)
