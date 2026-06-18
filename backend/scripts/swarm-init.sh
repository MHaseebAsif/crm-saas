#!/bin/bash
set -e

docker swarm init

echo "$(cat ../secrets/db_password.txt)" | docker secret create db_password -
echo "$(cat ../secrets/jwt_secret.txt)" | docker secret create jwt_secret -
echo "$(cat ../secrets/redis_password.txt)" | docker secret create redis_password -
echo "$(cat ../secrets/rabbitmq_password.txt)" | docker secret create rabbitmq_password -

docker stack deploy -c ../docker-stack.yml crm-saas
