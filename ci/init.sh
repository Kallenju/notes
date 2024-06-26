# /bin/sh

set -e

current_dir="$(cd "$(dirname "$0")" && pwd)"

docker_secrets_names=(
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
    "notes-frontend-server-auth-private-key"
    "notes-frontend-server-auth-passphrase"
    "notes-pgadmin-default-email"
    "notes-pgadmin-default-password"
    "notes-nginx-certificate"
    "notes-nginx-certificate-key"
)

docker_secrets_file_paths=(
    "${current_dir}/secrets/notes-notes-db-postgres-passwd.txt"
    "${current_dir}/secrets/notes-access-token-jwt-secret.txt"
    "${current_dir}/secrets/notes-microservice-token-jwt-secret.txt"
    "${current_dir}/secrets/notes-google-client-id.txt"
    "${current_dir}/secrets/notes-google-csrf-token-jwt-secret.txt"
    "${current_dir}/secrets/notes-facebook-app-id.txt"
    "${current_dir}/secrets/notes-facebook-app-secret.txt"
    "${current_dir}/secrets/notes-facebook-csrf-token-jwt-secret.txt"
    "${current_dir}/secrets/notes-frontend-server-public-key.txt"
    "${current_dir}/secrets/notes-cookie-secret.txt"
    "${current_dir}/secrets/notes-frontend-server-auth-private-key.txt"
    "${current_dir}/secrets/notes-frontend-server-auth-passphrase.txt"
    "${current_dir}/secrets/notes-pgadmin-default-email.txt"
    "${current_dir}/secrets/notes-pgadmin-default-password.txt"
    "${current_dir}/secrets/notes-nginx-certificate.pem"
    "${current_dir}/secrets/notes-nginx-certificate-key.pem"
)

for item in "${docker_secrets_file_paths[@]}"
do
    if [ ! -f $item ] || \
        [ ! -s $item ]; then
        echo "You need to create the file (${item}) with secret"
        exit 1
    fi
done

docker swarm init
docker network create -d overlay notes-nginx-reversive-proxy
docker network create -d overlay notes-backend
docker network create -d overlay notes-notes-db

for (( i=0; i<${#docker_secrets_names[@]}; i++ ));
do
    docker create ${docker_secrets_names[$i]} ${docker_secrets_file_paths[$i]}
done

"${current_dir}"/create-swarm-notes-notes-db.sh
"${current_dir}"/create-swarm-notes-backend.sh
"${current_dir}"/create-swarm-notes-task-manager.sh
"${current_dir}"/create-swarm-notes-pgadmin4.sh
"${current_dir}"/create-swarm-notes-frontend-server.sh
"${current_dir}"/create-swarm-notes-nginx-reversive-proxy.sh
