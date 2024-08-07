# /bin/sh

set -e

docker service create \
    --name swarm-notes-nginx-reversive-proxy \
    --constraint 'node.labels.notes == nginx' \
    --mode global \
    --stop-signal SIGTERM \
    --stop-grace-period 20s \
    --init \
    --restart-condition any \
    --secret notes-nginx-certificate.pem \
    --secret notes-nginx-certificate-key.pem \
    --publish published=80,target=80,protocol=tcp,mode=host \
    --publish published=443,target=443,protocol=tcp,mode=host \
    --mount type=volume,source=notes-nginx-logs,target=//var/log/nginx/,readonly=false \
    --network notes-nginx-reversive-proxy \
    kallenju/notes-nginx:latest
