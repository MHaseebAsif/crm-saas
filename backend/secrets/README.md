# Secrets

All .txt files in this directory contain placeholder values.

Replace each before deploying:

db_password.txt       - PostgreSQL password
jwt_secret.txt        - RS256 private key or JWT secret
redis_password.txt    - Redis AUTH password
rabbitmq_password.txt - RabbitMQ default user password

Load into Docker Swarm:

    cat db_password.txt | docker secret create db_password -
    cat jwt_secret.txt | docker secret create jwt_secret -
    cat redis_password.txt | docker secret create redis_password -
    cat rabbitmq_password.txt | docker secret create rabbitmq_password -

Add secrets/*.txt to .gitignore before committing real values.
