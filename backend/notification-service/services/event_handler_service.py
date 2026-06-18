from helpers.event_consumer import cons_evt
import json

async def proc_msg(b: bytes):
    d = json.loads(b)
    pass

async def start_cons():
    await cons_evt("notif_q", proc_msg)
