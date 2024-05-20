FROM alpine:3.19.1 as base
USER root
RUN apk update \
    && apk add --no-cache postgresql-client logrotate \
    && apk cache clean
RUN addgroup -S -g 2001 task-manager \
    && adduser -S -u 1001 -G task-manager task-manager \
    && chown task-manager:task-manager /home/task-manager \
    && mkdir -p /var/log/cron/ \
    && chown -R task-manager:task-manager /var/log/cron/ \
    && mkdir -p /var/opt/pgbackups/ \
    && chown -R task-manager:task-manager /var/opt/pgbackups/
COPY --chown=task-manager:task-manager ./src/cron/Crontab /home/task-manager/cronjob
COPY --chown=task-manager:task-manager ./src/tasks/ /home/task-manager/tasks/
RUN crontab -u task-manager /home/task-manager/cronjob \
    && chmod +x /home/task-manager/tasks/*.sh
COPY ./logrotate /etc/logrotate.d/task-manager
RUN chmod 644 /etc/logrotate.d/task-manager
STOPSIGNAL SIGTERM
VOLUME /var/log/cron/ /var/opt/pgbackups/

HEALTHCHECK --interval=360s --timeout=3s --start-period=15s --start-interval=1s --retries=5 \
    CMD ps aux | grep crond | grep -v grep || exit 1

FROM base as dev
COPY --chown=task-manager:task-manager ./.development.env /home/task-manager/tasks/environment
ENTRYPOINT ["crond", "-f", "-d", "8", "-l", "8", "-L", "/var/log/cron/cron.log"]

FROM base as prod
LABEL org.opencontainers.image.title="Notes Task Manager" \
      org.opencontainers.image.description="Notes Task Manager" \
      org.opencontainers.image.authors="https://github.com/Kallenju" \
      org.opencontainers.image.url="https://github.com/Kallenju/notes" \
      org.opencontainers.image.documentation="https://github.com/Kallenju/notes" \
      org.opencontainers.image.source="https://github.com/Kallenju/notes"
COPY --chown=task-manager:task-manager ./.development.env /home/task-manager/tasks/environment
ENTRYPOINT ["crond", "-f", "-d", "8", "-l", "8", "-L", "/var/log/cron/cron.log"]
