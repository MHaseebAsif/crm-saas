from configs.rabbitmq import get_rmq
import aio_pika

async def cons_evt(q_nm: str, cb):
    conn = await get_rmq()
    ch = await conn.channel()
    q = await ch.declare_queue(q_nm, durable=True)
    async with q.iterator() as it:
        async for msg in it:
            async with msg.process():
                await cb(msg.body)
