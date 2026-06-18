#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

DBS=("auth_db" "user_db" "crm_db" "notification_db")

for db in "${DBS[@]}"; do
    PGPASSWORD="$DB_PASS" pg_dump \
        -h "${DB_HOST:-localhost}" \
        -U "${DB_USER:-admin}" \
        -d "$db" \
        -f "$BACKUP_DIR/${db}.sql"
    echo "$db backed up to $BACKUP_DIR/${db}.sql"
done
