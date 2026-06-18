#!/bin/bash
set -e

ENDPOINTS=(
    "http://localhost:8001/health"
    "http://localhost:8002/health"
    "http://localhost:8003/health"
    "http://localhost:8004/health"
    "http://localhost:80/health"
)

NAMES=("auth-service" "user-service" "crm-service" "notification-service" "nginx")

for i in "${!ENDPOINTS[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "${ENDPOINTS[$i]}")
    if [ "$status" = "200" ]; then
        echo "${NAMES[$i]}: OK"
    else
        echo "${NAMES[$i]}: FAIL (HTTP $status)"
        exit 1
    fi
done
