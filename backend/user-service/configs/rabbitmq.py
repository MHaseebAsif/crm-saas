import aio_pika
from .settings import SETTINGS

async def get_rmq():
    conn = await aio_pika.connect_robust(SETTINGS.rmq_url)
    return conn
