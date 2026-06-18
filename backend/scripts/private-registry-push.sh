#!/bin/bash
set -e

REGISTRY="localhost:5000"
SERVICES=("auth-service" "user-service" "crm-service" "notification-service" "nginx")
VERSIONS=("v1.0.0" "v1.1.0" "latest")

docker login "$REGISTRY" -u "$REG_USER" -p "$REG_PASS"

for svc in "${SERVICES[@]}"; do
    docker build -t "$svc" "../$svc"
    for ver in "${VERSIONS[@]}"; do
        docker tag "$svc" "$REGISTRY/crm-saas-$svc:$ver"
        docker push "$REGISTRY/crm-saas-$svc:$ver"
    done
done
