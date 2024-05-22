# /bin/sh

set -e

docker service create \
    --replicas 1 \
    --name swarm-notes-task-manager \
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
    --network notes-backend \
    --network notes-notes-db \
    kallenju/notes-task-manager:latest
