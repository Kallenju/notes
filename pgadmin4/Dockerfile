FROM dpage/pgadmin4:8.3 as base
STOPSIGNAL SIGTERM
EXPOSE 5050/tcp
HEALTHCHECK --interval=360s --timeout=3s --start-period=20s --start-interval=1s --retries=5 \
    CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:80/misc/ping || exit 1

FROM dpage/pgadmin4:8.3 as dev
VOLUME /pgadmin4/servers.json

FROM dpage/pgadmin4:8.3 as prod
