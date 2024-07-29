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
    --volume "/home/ec2-user/letsencrypt/ssl/:/etc/letsencrypt/" \
    --volume "/home/ec2-user/letsencrypt/logs/:/var/log/letsencrypt/" \
    --volume "/home/ec2-user/letsencrypt/root/:/var/www/html/" \
    certbot/certbot certonly \
    --webroot
    -w /var/www/html
    -d ${domain}
    --agree-tos
