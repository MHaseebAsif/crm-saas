from configs.rabbitmq import get_rmq
import aio_pika

async def cons_evt(q_nm: str, exc: str, rt: str, cb):
    conn = await get_rmq()
    ch = await conn.channel()
    ex = await ch.declare_exchange(exc, aio_pika.ExchangeType.TOPIC)
    q = await ch.declare_queue(q_nm, durable=True)
    await q.bind(ex, routing_key=rt)
    async with q.iterator() as it:
        async for msg in it:
            async with msg.process():
                await cb(msg.body)
