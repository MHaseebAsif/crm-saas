from configs.redis import r_pool

async def is_lim(ip: str, max_r: int = 10, win: int = 60) -> bool:
    k = f"rl:{ip}"
    c = await r_pool.incr(k)
    if c == 1:
        await r_pool.expire(k, win)
    return c > max_r
