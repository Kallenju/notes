docker service update \
    --image kallenju/notes-backend:latest \
    swarm-notes-backend

docker service update \
    --force \
    swarm-notes-nginx-reversive-proxy
