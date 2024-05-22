# /bin/sh

docker run --rm -it \
    --name certbot \
    --env AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE \
    --env AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY \
    -v "/etc/letsencrypt:/etc/letsencrypt" \
    -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
    certbot/dns-route53 renew \
    --dns-route53 --agree-tos 

certbot_cert=/etc/letsencrypt/live/coderevolve-site.com/cert.pem
certbot_key=/etc/letsencrypt/live/coderevolve-site.com/privkey.pem

nginx_cert=/path/to/nginx/ssl/certificate.pem
nginx_key=/path/to/nginx/ssl/key.pem

if [ "$certbot_cert" -nt "$nginx_cert" ]
then
    echo "Updating certificate..."
    cp $certbot_cert $nginx_cert
    cp $certbot_key $nginx_key
    echo "Reloading nginx..."
    docker exec reverseproxy nginx -s reload
    echo "Done!"
else
    echo "Certificate is already up-to-date."
fi