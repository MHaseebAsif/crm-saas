# CRM SaaS Platform

A multi-tenant CRM platform built with a microservices architecture using FastAPI, PostgreSQL, Redis, RabbitMQ, Docker Swarm, and Kubernetes.

---

## Architecture

```
                        +----------+
                        |  Client  |
                        +----+-----+
                             |
                        +----v-----+
                        |  nginx   |  :80
                        +----+-----+
                             |
         +-------------------+-------------------+
         |           |              |             |
   +-----v----+ +----v-----+ +------v----+ +------v-------+
   |  auth    | |  user    | |   crm     | | notification |
   | :8001    | | :8002    | |  :8003    | |   :8004      |
   +-----+----+ +----+-----+ +------+----+ +------+-------+
         |           |              |             |
         +-----+-----+--------------+-------------+
               |             |              |
        +------v---+   +------v---+   +-----v------+
        |PostgreSQL|   |  Redis   |   |  RabbitMQ  |
        | :5432    |   |  :6379   |   |  :5672     |
        +----------+   +----------+   +------------+

         +-------------------+
         |     Monitoring    |
         | Prometheus :9090  |
         | Grafana    :3001  |
         +-------------------+
```

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| API Framework  | FastAPI                             |
| ORM            | Tortoise ORM + Aerich               |
| Database       | PostgreSQL 15                       |
| Cache          | Redis 7                             |
| Message Broker | RabbitMQ 3                          |
| Auth           | JWT RS256 + bcrypt                  |
| WebSocket      | FastAPI WebSocket                   |
| Email          | aiosmtplib                          |
| Reverse Proxy  | nginx:alpine                        |
| Container      | Docker + Docker Swarm               |
| Orchestration  | Kubernetes + Kustomize              |
| Monitoring     | Prometheus + Grafana                |
| Registry       | Docker Hub + Private registry:2     |

---

## Run Locally

```bash
cp backend/docker/.env.example backend/docker/.env
docker compose -f backend/docker/docker-compose.yml up --build
```

Service endpoints:

| Service              | URL                        |
|----------------------|----------------------------|
| nginx                | http://localhost:80        |
| auth-service         | http://localhost:8001      |
| user-service         | http://localhost:8002      |
| crm-service          | http://localhost:8003      |
| notification-service | http://localhost:8004      |
| RabbitMQ management  | http://localhost:15672     |
| Prometheus           | http://localhost:9090      |
| Grafana              | http://localhost:3001      |

---

## Docker Hub Push

```bash
export DOCKER_HUB_USER=your_dockerhub_username
export DOCKER_HUB_PASS=your_dockerhub_password
bash backend/scripts/docker-hub-push.sh
```

This builds, tags, and pushes all 5 images with tags: v1.0.0, v1.1.0, latest.

---

## Private Registry Setup

```bash
docker run -d -p 5000:5000 --name registry \
  -v $(pwd)/backend/registry/config.yml:/etc/docker/registry/config.yml \
  registry:2

bash backend/scripts/private-registry-push.sh
```

---

## Docker Swarm Deploy

```bash
bash backend/scripts/swarm-init.sh
```

This runs:
1. docker swarm init
2. Creates Docker secrets from backend/secrets/*.txt
3. Deploys the stack with docker-stack.yml

Verify:

```bash
docker stack services crm-saas
docker stack ps crm-saas
```

---

## Docker Networking

### Bridge Network
The default network driver. Containers on the same bridge network can communicate using container names as DNS. Used for single-host deployments.

When to use: local development, docker compose on a single machine.

### Host Network
Removes network isolation between container and host. The container shares the host's network stack directly.

When to use: performance-critical applications that need lowest possible latency, or when port mapping overhead must be eliminated.

### None Network
Completely disables networking for the container. No network interfaces except loopback.

When to use: batch processing jobs that need no network access, maximum isolation for security-sensitive workloads.

### Overlay Network
A distributed network that spans multiple Docker hosts in a Swarm or cluster. Uses VXLAN encapsulation to create a virtual layer-2 network across physical hosts.

When to use: multi-host deployments, Docker Swarm, container-to-container communication across nodes.

### Why we chose Overlay for this project

This project uses Docker Swarm with services distributed across multiple nodes. Overlay networks enable service-to-service communication using service names as DNS regardless of which physical node a container is running on. It provides:

- Automatic service discovery across nodes
- Encrypted communication between services
- Network isolation per logical group (frontend_network, backend_network, monitoring_network)

---

## Rolling Update (v1.0.0 to v1.1.0)

```bash
export DOCKER_HUB_USER=your_dockerhub_username
bash backend/scripts/rolling-update.sh
```

This updates each service one replica at a time with:
- parallelism: 1
- delay: 10s between replicas
- order: start-first (zero downtime)

Rollback if needed:

```bash
docker service rollback crm-saas_auth-service
```

---

## Health Checks

```bash
bash backend/scripts/health-check.sh
```

Or manually:

```bash
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
curl http://localhost:80/health
```

---

## Monitoring

| Service    | URL                          | Default Credentials |
|------------|------------------------------|---------------------|
| Prometheus | http://localhost:9090        | none                |
| Grafana    | http://localhost:3001        | admin / adminpass   |

Dashboards available after login:
- Services Overview: CPU, Memory, Network, Request Count
- Container Health: restarts, uptime, running containers

Alerts configured:
- ServiceDown: fires if any service is unreachable for 1 minute
- HighCPUUsage: fires if CPU exceeds 80% for 2 minutes
- HighMemoryUsage: fires if memory exceeds 512MB for 2 minutes

---

## Docker Secrets Setup

```bash
echo "your_db_password"       | docker secret create db_password -
echo "your_jwt_secret"        | docker secret create jwt_secret -
echo "your_redis_password"    | docker secret create redis_password -
echo "your_rabbitmq_password" | docker secret create rabbitmq_password -
```

Or using files:

```bash
cat backend/secrets/db_password.txt       | docker secret create db_password -
cat backend/secrets/jwt_secret.txt        | docker secret create jwt_secret -
cat backend/secrets/redis_password.txt    | docker secret create redis_password -
cat backend/secrets/rabbitmq_password.txt | docker secret create rabbitmq_password -
```

List secrets:

```bash
docker secret ls
```

---

## Environment Variables Reference

| Variable       | Description                        | Example                              |
|----------------|------------------------------------|--------------------------------------|
| DB_URL         | PostgreSQL connection string       | postgres://admin:pass@postgresql/db  |
| REDIS_URL      | Redis connection string            | redis://redis:6379/0                 |
| RMQ_URL        | RabbitMQ AMQP connection string    | amqp://guest:guest@rabbitmq:5672/    |
| PRIV_KEY       | RSA private key for JWT signing    | -----BEGIN RSA PRIVATE KEY-----      |
| PUB_KEY        | RSA public key for JWT validation  | -----BEGIN PUBLIC KEY-----           |
| SMTP_HOST      | SMTP server hostname               | smtp.gmail.com                       |
| SMTP_PORT      | SMTP server port                   | 587                                  |
| SMTP_USER      | SMTP authentication username       | user@gmail.com                       |
| SMTP_PASS      | SMTP authentication password       | apppassword                          |
| GF_USER        | Grafana admin username             | admin                                |
| GF_PASS        | Grafana admin password             | adminpass                            |
| DOCKER_HUB_USER| Docker Hub username                | myusername                           |
| DOCKER_HUB_PASS| Docker Hub password or token       | mytoken                              |
| REG_USER       | Private registry username          | reguser                              |
| REG_PASS       | Private registry password          | regpass                              |
