# /bin/sh

set -e

docker service create \
    --replicas 1 \
    --name swarm-notes-frontend-server \
    --env NODE_ENV=production \
    --env PORT=3000 \
    --env AUTH_PRIVATE_KEY=/run/secrets/notes-frontend-server-auth-private-key \
    --env AUTH_PASSPHRASE=/run/secrets/notes-frontend-server-auth-passphrase \
    --env BACKEND_URL=http://swarm-notes-backend:3000 \
    --env BACKEND_TOKEN=initial \
    --env AWS_FRONTEND_BUCKET_ARN=/run/secrets/notes-aws-frontend-bucket-arn-frontend-server \
    --env AWS_FRONTEND_BUCKET=/run/secrets/notes-aws-frontend-bucket \
    --secret notes-frontend-server-auth-private-key \
    --secret notes-frontend-server-auth-passphrase \
    --stop-signal SIGTERM \
    --stop-grace-period 20s \
    --init \
    --restart-condition any \
    --mount type=volume,source=notes-frontend-public,target=//usr/app/frontend/public/,readonly=true \
    --mount type=volume,source=notes-frontend-views,target=//usr/app/frontend/views/,readonly=true \
    --network notes-nginx-reversive-proxy \
    --network notes-backend \
    kallenju/notes-frontend-server:latest
