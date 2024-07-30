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

certbot_container="swarm-notes-certbot"

docker run --rm -d \
    --name ${certbot_container} \
    --network notes-nginx-reversive-proxy \
    --mount source=swarm-notes-cerbot-ssl,target=/etc/letsencrypt/ \
    --mount source=swarm-notes-cerbot-logs,target/var/log/letsencrypt/ \
    certbot/certbot renew \
    --standalone \
    -d ${domain} \
    --agree-tos

certbot_cert="/etc/letsencrypt/live/${domain}/cert.pem"
certbot_key="/etc/letsencrypt/live/${domain}/privkey.pem"

nginx_cert_dummy="${current_dir}/../secrets/dummy-notes-nginx-certificate.pem"
nginx_key_dummy="${current_dir}/../secrets/dummy-notes-nginx-certificate-key.pem"

nginx_cert="${current_dir}/../secrets/notes-nginx-certificate.pem"
nginx_key="${current_dir}/../secrets/notes-nginx-certificate-key.pem"

if [ "${certbot_cert}" -nt "${nginx_cert}" ]; then
    echo "Create container for copy"
    docker run -d \
      --name tail-container \
      --mount source=swarm-notes-cerbot-ssl,target=/etc/letsencrypt/ \
      --mount source=swarm-notes-cerbot-logs,target=/var/log/letsencrypt/ \
      alpine:3.20.2 \
      sh -c "mkdir -p /downloads && tail -f /dev/null"
    echo "Copy new certs..."
    docker cp -L "tail-container:${certbot_cert}" "${nginx_cert_dummy}"
    docker cp -L "tail-container:${certbot_key}" "${nginx_key_dummy}"
    echo "Create dummy secrets..."
    docker secret create dummy-notes-nginx-certificate.pem "${nginx_cert_dummy}"
    docker secret create dummy-notes-nginx-certificate-key.pem "${nginx_key_dummy}"
    echo "Update nginx service with dummy secrets..."
    docker service update \
        --secret-rm notes-nginx-certificate.pem \
        --secret-rm notes-nginx-certificate-key.pem \
        --secret-add source=dummy-notes-nginx-certificate.pem,target=/run/secrets/notes-nginx-certificate.pem \
        --secret-add source=dummy-notes-nginx-certificate-key.pem,target=/run/secrets/nginx-certificate-key.pem \
        swarm-notes-nginx-reversive-proxy
    echo "Remove secrets..."
    docker secret create rm notes-nginx-certificate.pem
    docker secret create rm notes-nginx-certificate-key.pem
    rm "${nginx_cert}"
    rm "${nginx_key}"
    echo "Rename secrets..."
    mv "${nginx_cert_dummy}" "${nginx_cert}"
    mv "${nginx_key_dummy}" "${nginx_key}"
    echo "Re-create secrets..."
    docker secret create notes-nginx-certificate.pem "${nginx_cert}"
    docker secret create notes-nginx-certificate-key.pem "${nginx_key}"
    echo "Update nginx service with normal secrets..."
    docker service update \
        --secret-rm dummy-notes-nginx-certificate.pem \
        --secret-rm dummy-notes-nginx-certificate-key.pem \
        --secret-add notes-nginx-certificate.pem \
        --secret-add notes-nginx-certificate-key.pem \
        swarm-notes-nginx-reversive-proxy
    echo "Remove dummy secrets..."
    docker secret create rm dummy-notes-nginx-certificate.pem
    docker secret create rm dummy-notes-nginx-certificate-key.pem
    echo "Done!"
else
    echo "Certificate is already up-to-date."
fi
