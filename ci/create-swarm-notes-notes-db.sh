# /bin/sh

set -e

docker service create \
    --replicas 1 \
    --name swarm-notes-notes-db \
    --env POSTGRES_PASSWORD_FILE=/run/secrets/notes-notes-db-postgres-passwd \
    --env POSTGRES_DB=notes \
    --env POSTGRES_USER=postgres \
    --env POSTGRES_PORT=5432 \
    --env POSTGRES_HOST=0.0.0.0 \
    --secret notes-notes-db-postgres-passwd \
    --mount type=volume,source=notes-db-data,target=/var/lib/postgresql/data/,readonly=false \
    --network notes-notes-db \
    --stop-signal SIGTERM \
    --stop-grace-period 20s \
    --init --restart-condition any \
    --limit-memory 256mb \
    kallenju/notes-notes-db:latest
