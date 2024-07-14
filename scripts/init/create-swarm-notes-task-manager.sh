# /bin/sh

set -e

docker service create \
    --replicas 1 \
    --name swarm-notes-task-manager \
    --constraint 'node.labels.notes == other' \
    --env PRODUCTION=true \
    --env BACKUP_KEEP_DAYS=1 \
    --env NOTES_POSTGRES_PASSWORD=/run/secrets/notes-notes-db-postgres-passwd \
    --env NOTES_POSTGRES_DATABASE=notes \
    --env NOTES_POSTGRES_USER=postgres \
    --env NOTES_POSTGRES_HOST=swarm-notes-db \
    --env NOTES_POSTGRES_PORT=5432 \
    --secret notes-notes-db-postgres-passwd \
    --stop-signal SIGTERM \
    --stop-grace-period 20s \
    --init \
    --restart-condition any \
    --mount type=volume,source=notes-task-manager-logs,target=//var/log/cron/,readonly=false \
    --mount type=volume,source=notes-task-manager-pgbackups,target=//var/opt/pgbackups/,readonly=false \
    --network notes-backend \
    --network notes-notes-db \
    kallenju/notes-task-manager:latest
