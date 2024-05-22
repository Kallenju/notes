# /bin/sh

# docker volume create --name notes-frontend-public
# docker volume create --name notes-frontend-views
# docker volume create --name notes-db-data

set -e

current_dir="$(cd "$(dirname "$0")" && pwd)"/

secrets_names=(
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
)

secrets_file_paths=(
    "./secrets/notes-notes-db-postgres-passwd.txt"
    "./secrets/notes-access-token-jwt-secret.txt"
    "./secrets/notes-microservice-token-jwt-secret.txt"
    "./secrets/notes-google-client-id.txt"
    "./secrets/notes-google-csrf-token-jwt-secret.txt"
    "./secrets/notes-facebook-app-id.txt"
    "./secrets/notes-facebook-app-secret.txt"
    "./secrets/notes-facebook-csrf-token-jwt-secret.txt"
    "./secrets/notes-frontend-server-public-key.txt"
    "./secrets/notes-cookie-secret.txt"
    "./secrets/notes-frontend-server-auth-private-key.txt"
    "./secrets/notes-frontend-server-auth-passphrase.txt"
    "./secrets/notes-pgadmin-default-email.txt"
    "./secrets/notes-pgadmin-default-password.txt"
)

for item in "${secrets_file_paths[@]}"
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

for (( i=0; i<${#secrets_names[@]}; i++ ));
do
    docker create ${secrets_names[i]} ${secrets_file_paths[i]}
done

"${current_dir}"/create-swarm-notes-notes-db.sh
"${current_dir}"/create-swarm-notes-backend.sh
"${current_dir}"/create-swarm-notes-task-manager.sh
"${current_dir}"/create-swarm-notes-pgadmin4.sh
"${current_dir}"/create-swarm-notes-frontend-server.sh
"${current_dir}"/create-swarm-notes-nginx-reversive-proxy.sh
