#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
while ! python -c "import socket; s = socket.socket(); s.connect(('postgresql', 5432))" 2>/dev/null; do
    sleep 1
done
echo "PostgreSQL started"

aerich init-db || aerich upgrade
exec uvicorn main:app --host 0.0.0.0 --port 8000
