#!/bin/bash
set -e

services=("auth-service" "user-service" "crm-service" "notification-service")

for svc in "${services[@]}"; do
    echo "Running aerich migrations for $svc"
    cd /app
    aerich upgrade
done
