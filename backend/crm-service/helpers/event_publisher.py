from configs.rabbitmq import get_rmq
import aio_pika
import json

async def pub_evt(exc: str, rt: str, data: dict):
    conn = await get_rmq()
    async with conn:
        ch = await conn.channel()
        ex = await ch.declare_exchange(exc, aio_pika.ExchangeType.TOPIC)
        msg = aio_pika.Message(body=json.dumps(data).encode())
        await ex.publish(msg, routing_key=rt)
