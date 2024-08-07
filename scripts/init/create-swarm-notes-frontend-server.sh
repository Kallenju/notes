# /bin/sh

set -e

docker service create \
    --replicas 1 \
    --name swarm-notes-frontend-server \
    --constraint 'node.labels.notes == other' \
    --env NODE_ENV=production \
    --env PORT=3000 \
    --env AUTH_PRIVATE_KEY=//run/secrets/notes-frontend-server-private-key \
    --env AUTH_PASSPHRASE=//run/secrets/notes-frontend-server-passphrase \
    --env BACKEND_URL=http://swarm-notes-backend:3000 \
    --env BACKEND_TOKEN=initial \
    --env AWS_FRONTEND_BUCKET_ARN=//run/secrets/notes-aws-frontend-bucket-arn-frontend-server \
    --env AWS_FRONTEND_BUCKET=//run/secrets/notes-aws-frontend-bucket \
    --secret notes-frontend-server-private-key \
    --secret notes-frontend-server-passphrase \
    --secret notes-aws-frontend-bucket-arn-frontend-server \
    --secret notes-aws-frontend-bucket \
    --stop-signal SIGTERM \
    --stop-grace-period 20s \
    --init \
    --restart-condition any \
    --mount type=volume,source=notes-frontend-server-logs,target=//var/log/frontend-server/,readonly=false \
    --network notes-nginx-reversive-proxy \
    --network notes-backend \
    kallenju/notes-frontend-server:latest
