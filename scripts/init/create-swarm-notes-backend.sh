# /bin/sh

set -e

docker service create \
    --replicas 1 \
    --name swarm-notes-backend \
    --constraint 'node.labels.notes == other' \
    --env NODE_ENV=production \
    --env PORT=3000 \
    --env ACCESS_TOKEN_JWT_SECRET=/run/secrets/notes-access-token-jwt-secret \
    --env MICROSERVICE_TOKEN_JWT_SECRET=/run/secrets/notes-microservice-token-jwt-secret \
    --env GOOGLE_CLIENT_ID=/run/secrets/notes-google-client-id \
    --env GOOGLE_CSRF_TOKEN_JWT_SECRET=/run/secrets/notes-google-csrf-token-jwt-secret \
    --env FACEBOOK_APP_ID=/run/secrets/notes-facebook-app-id \
    --env FACEBOOK_APP_SECRET=/run/secrets/notes-facebook-app-secret \
    --env FACEBOOK_APP_DEVELOPMENT_ACCESS_TOKEN='null' \
    --env FACEBOOK_CSRF_TOKEN_JWT_SECRET=/run/secrets/notes-facebook-csrf-token-jwt-secret \
    --env FRONTEND_SERVER_PUBLIC_KEY=/run/secrets/notes-frontend-server-public-key \
    --env COOKIE_SECRET=/run/secrets/notes-cookie-secret \
    --env PGPASSWORD=/run/secrets/notes-notes-db-postgres-passwd \
    --env PGUSER=postgres \
    --env PGDATABASE=notes \
    --env PGPORT=5432 \
    --env PGHOST=swarm-notes-notes-db \
    --secret notes-access-token-jwt-secret \
    --secret notes-microservice-token-jwt-secret \
    --secret notes-google-client-id \
    --secret notes-google-csrf-token-jwt-secret \
    --secret notes-facebook-app-id \
    --secret notes-facebook-app-secret \
    --secret notes-facebook-csrf-token-jwt-secret \
    --secret notes-frontend-server-public-key \
    --secret notes-cookie-secret \
    --secret notes-notes-db-postgres-passwd \
    --stop-signal SIGTERM \
    --stop-grace-period 20s \
    --init \
    --restart-condition any \
    --mount type=bind,source=//var/log/backend/,target=//var/log/backend/,readonly=false \
    --network notes-nginx-reversive-proxy \
    --network notes-backend \
    --network notes-notes-db \
    kallenju/notes-backend:latest
