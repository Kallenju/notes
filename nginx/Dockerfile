FROM nginx:1.25.3-alpine-slim
COPY ./logrotate /etc/logrotate.d/nginx
RUN chmod 644 /etc/logrotate.d/nginx
VOLUME /etc/nginx/nginx.conf /etc/logrotate.d/nginx /var/log/nginx/
EXPOSE 80/tcp 5050/tcp 9929/tcp 9929/tcp
HEALTHCHECK --interval=360s --timeout=3s --start-period=15s --start-interval=1s --retries=5 \
    CMD ps aux | grep nginx | grep -v grep || exit 1
STOPSIGNAL SIGTERM
