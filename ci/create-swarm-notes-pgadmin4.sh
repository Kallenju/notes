# /bin/sh

set -e

docker service create \
    --replicas 1 \
    --name swarm-notes-pgadmin4 \
    --env PGADMIN_DEFAULT_EMAIL=kostyasolovyov54@gmail.com \
    --env PGADMIN_DEFAULT_PASSWORD_FILE=/run/secrets/notes-pgadmin-default-password \
    --secret notes-pgadmin-default-password \
    --stop-signal SIGTERM \
    --stop-grace-period 20s \
    --init \
    --restart-condition any \
    --network notes-nginx-reversive-proxy \
    --network notes-notes-db \
    kallenju/notes-pgadmin4:latest
