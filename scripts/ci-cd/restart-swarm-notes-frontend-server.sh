docker service update \
    --image kallenju/notes-frontend-server:latest \
    swarm-notes-frontend-server

docker service update \
    --force \
    swarm-notes-nginx-reversive-proxy
