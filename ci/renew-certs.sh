#!/bin/sh

set -e

current_dir="$(cd "$(dirname "$0")" && pwd)"

secrets_file_paths=(
    "${current_dir}/secrets/notes-cert-aws-access-key-id.txt"
    "${current_dir}/secrets/notes-cert-aws-secret-access-key.txt"
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

docker run --rm -it \
    --name certbot \
    --env AWS_ACCESS_KEY_ID="${aws_access_key_id}" \
    --env AWS_SECRET_ACCESS_KEY="${aws_secret_access_key}" \
    --volume "/etc/letsencrypt/:/etc/letsencrypt/" \
    --volume "/var/lib/letsencrypt/:/var/lib/letsencrypt/" \
    certbot/dns-route53 renew \
    --dns-route53 --agree-tos

certbot_cert="/etc/letsencrypt/live/coderevolve-site.com/cert.pem"
certbot_key="/etc/letsencrypt/live/coderevolve-site.com/privkey.pem"

nginx_cert="/path/to/nginx/ssl/certificate.pem"
nginx_key="/path/to/nginx/ssl/key.pem"

if [ "$certbot_cert" -nt "$nginx_cert" ]; then
    echo "Updating certificate..."
    cp "$certbot_cert" "$nginx_cert"
    cp "$certbot_key" "$nginx_key"
    echo "Reloading nginx..."
    docker exec reverseproxy nginx -s reload
    echo "Done!"
else
    echo "Certificate is already up-to-date."
fi
