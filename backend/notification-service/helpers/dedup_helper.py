from configs.redis import r_pool

async def is_dup(notif_id: str) -> bool:
    k = f"dedup:{notif_id}"
    v = await r_pool.get(k)
    if v:
        return True
    await r_pool.setex(k, 3600, "1")
    return False
