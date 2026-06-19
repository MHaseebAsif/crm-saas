#!/bin/sh
echo "Waiting for PostgreSQL..."
python -c "
import time, psycopg2, os
url = os.getenv('DB_URL', 'postgres://admin:securepass@postgresql:5432/auth_db')
while True:
    try:
        psycopg2.connect(url)
        break
    except:
        time.sleep(1)
"
echo "PostgreSQL ready"
python -c "
import asyncio
from tortoise import Tortoise
from configs.database import TORTOISE_ORM
async def run():
    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas(safe=True)
    await Tortoise.close_connections()
asyncio.run(run())
"
exec uvicorn main:app --host 0.0.0.0 --port 8001
