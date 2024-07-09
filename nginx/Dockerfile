FROM nginx:1.25.3-alpine-slim AS base
RUN mkdir -p /var/log/nginx/ \
    && chown -R nginx:101 /var/log/nginx/
VOLUME /var/log/nginx/
LABEL org.opencontainers.image.title="Notes Nginx" \
      org.opencontainers.image.description="Notes Nginx" \
      org.opencontainers.image.authors="https://github.com/Kallenju" \
      org.opencontainers.image.url="https://github.com/Kallenju/notes" \
      org.opencontainers.image.documentation="https://github.com/Kallenju/notes" \
      org.opencontainers.image.source="https://github.com/Kallenju/notes"
COPY ./logrotate /etc/logrotate.d/nginx
RUN chmod 644 /etc/logrotate.d/nginx
EXPOSE 80/tcp 5050/tcp 9929/tcp 9929/tcp
HEALTHCHECK --interval=360s --timeout=3s --start-period=15s --start-interval=1s --retries=5 \
    CMD ps aux | grep nginx | grep -v grep || exit 1
STOPSIGNAL SIGTERM

FROM base AS dev
VOLUME /etc/nginx/nginx.conf /etc/logrotate.d/nginx /var/log/nginx/

FROM base AS prod
COPY --chown=nginx:101 ./nginx.prod.conf /etc/nginx/nginx.conf
