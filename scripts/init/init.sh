# /bin/sh

set -e

current_dir="$(cd "$(dirname "$0")" && pwd)"

docker_secrets_names=(
    "notes-aws-frontend-bucket"
    "notes-aws-frontend-bucket-arn-frontend-server"
    "notes-notes-db-postgres-passwd"
    "notes-access-token-jwt-secret"
    "notes-microservice-token-jwt-secret"
    "notes-google-client-id"
    "notes-google-csrf-token-jwt-secret"
    "notes-facebook-app-id"
    "notes-facebook-app-secret"
    "notes-facebook-csrf-token-jwt-secret"
    "notes-frontend-server-public-key"
    "notes-cookie-secret"
    "notes-frontend-server-private-key"
    "notes-frontend-server-passphrase"
    "notes-nginx-certificate.pem"
    "notes-nginx-certificate-key.pem"
)

docker_secrets_file_paths=(
    "${current_dir}/../secrets/notes-aws-frontend-bucket.txt"
    "${current_dir}/../secrets/notes-aws-frontend-bucket-arn-frontend-server.txt"
    "${current_dir}/../secrets/notes-notes-db-postgres-passwd.txt"
    "${current_dir}/../secrets/notes-access-token-jwt-secret.txt"
    "${current_dir}/../secrets/notes-microservice-token-jwt-secret.txt"
    "${current_dir}/../secrets/notes-google-client-id.txt"
    "${current_dir}/../secrets/notes-google-csrf-token-jwt-secret.txt"
    "${current_dir}/../secrets/notes-facebook-app-id.txt"
    "${current_dir}/../secrets/notes-facebook-app-secret.txt"
    "${current_dir}/../secrets/notes-facebook-csrf-token-jwt-secret.txt"
    "${current_dir}/../secrets/notes-frontend-server-public-key.txt"
    "${current_dir}/../secrets/notes-cookie-secret.txt"
    "${current_dir}/../secrets/notes-frontend-server-private-key.txt"
    "${current_dir}/../secrets/notes-frontend-server-passphrase.txt"
    "${current_dir}/../secrets/notes-nginx-certificate.pem"
    "${current_dir}/../secrets/notes-nginx-certificate-key.pem"
)

for item in "${docker_secrets_file_paths[@]}"
do
    if [ ! -f $item ] || \
        [ ! -s $item ]; then
        echo "You need to create the file (${item}) with secret"
        exit 1
    fi
done

docker network create --scope=swarm -d overlay --attachable notes-nginx-reversive-proxy
docker network create --scope=swarm -d overlay notes-backend
docker network create --scope=swarm -d overlay notes-notes-db

for (( i=0; i<${#docker_secrets_names[@]}; i++ ));
do
    docker secret create ${docker_secrets_names[$i]} ${docker_secrets_file_paths[$i]}
done
