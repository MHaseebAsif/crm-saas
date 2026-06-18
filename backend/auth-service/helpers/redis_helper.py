from configs.redis import r_pool

async def set_kv(k: str, v: str, exp: int = 3600):
    await r_pool.setex(k, exp, v)

async def get_kv(k: str) -> str | None:
    return await r_pool.get(k)
