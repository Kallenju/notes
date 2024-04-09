FROM alpine:3.19.1 as base
USER root
RUN addgroup -S -g 2001 task-manager \
    && adduser -S -u 1001 -G task-manager task-manager \
    && chown task-manager:task-manager /home/task-manager \
    && mkdir -p /var/log/cron/ \
    && chown -R task-manager:task-manager /var/log/cron/ \
    && mkdir -p /tmp/cron/ \
    && chown -R task-manager:task-manager /tmp/cron/
COPY --chown=task-manager:task-manager ./src/cron/Crontab /home/task-manager/cronjob
COPY --chown=task-manager:task-manager ./src/tasks/ /home/task-manager/tasks/
RUN crontab -u task-manager /home/task-manager/cronjob \
    && chmod +x /home/task-manager/tasks/*.sh
STOPSIGNAL SIGTERM
VOLUME /var/log/cron/
HEALTHCHECK --interval=360s --timeout=3s --start-period=10s --start-interval=1s --retries=5 \
    CMD ps aux | grep crond | grep -v grep || exit 1

FROM base as dev
ENTRYPOINT ["crond", "-f", "-d", "8", "-l", "8", "-L", "/var/log/cron/cron.log"]

FROM base as prod
ENTRYPOINT ["crond", "-f", "-d", "8", "-l", "8", "-L", "/var/log/cron/cron.log"]
