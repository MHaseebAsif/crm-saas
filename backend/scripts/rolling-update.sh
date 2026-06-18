#!/bin/bash
set -e

STACK="crm-saas"
REGISTRY="${DOCKER_HUB_USER}"
NEW_VER="v1.1.0"

SERVICES=("auth-service" "user-service" "crm-service" "notification-service" "nginx")

for svc in "${SERVICES[@]}"; do
    docker service update \
        --image "$REGISTRY/crm-saas-$svc:$NEW_VER" \
        --update-parallelism 1 \
        --update-delay 10s \
        --update-order start-first \
        "${STACK}_${svc}"
    echo "$svc updated to $NEW_VER"
done
