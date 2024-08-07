#!/bin/sh

set -e

current_dir="$(cd "$(dirname "$0")" && pwd)"

secrets_file_paths=(
    "${current_dir}/../secrets/notes-cert-domain.txt"
)

for item in "${docker_secrets_file_paths[@]}"
do
    if [ ! -f $item ] || \
        [ ! -s $item ]; then
        echo "You need to create the file (${item}) with secret"
        exit 1
    fi
done

domain=$(cat "${secrets_file_paths[0]}")

docker run --rm -it \
    --name swarm-notes-certbot \
    --network notes-nginx-reversive-proxy \
    --mount source=swarm-notes-cerbot-ssl,target=/etc/letsencrypt/ \
    --mount source=swarm-notes-cerbot-logs,target=/var/log/letsencrypt/ \
    certbot/certbot certonly \
    --standalone \
    -d ${domain} \
    --agree-tos
