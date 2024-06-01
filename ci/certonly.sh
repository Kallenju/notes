#!/bin/sh

set -e

current_dir="$(cd "$(dirname "$0")" && pwd)"

secrets_file_paths=(
    "${current_dir}/secrets/notes-cert-aws-access-key-id.txt"
    "${current_dir}/secrets/notes-cert-aws-secret-access-key.txt"
    "${current_dir}/secrets/notes-cert-domain.txt"
)

for item in "${docker_secrets_file_paths[@]}"
do
    if [ ! -f $item ] || \
        [ ! -s $item ]; then
        echo "You need to create the file (${item}) with secret"
        exit 1
    fi
done

aws_access_key_id=$(cat "${secrets_file_paths[0]}")
aws_secret_access_key=$(cat "${secrets_file_paths[1]}")
domain=$(cat "${secrets_file_paths[2]}")

docker run --rm -it \
    --name certbot \
    --env AWS_ACCESS_KEY_ID="${aws_access_key_id}" \
    --env AWS_SECRET_ACCESS_KEY="${aws_secret_access_key}" \
    --volume "/etc/letsencrypt/:/etc/letsencrypt/" \
    --volume "/var/lib/letsencrypt/:/var/lib/letsencrypt/" \
    certbot/dns-route53 certonly \
    --dns-route53 \
    -d ${domain} \
    --agree-tos
