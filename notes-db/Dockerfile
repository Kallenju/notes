FROM postgres:16.2-alpine AS base
VOLUME /var/log/postgres/ /var/lib/postgresql/data/
STOPSIGNAL SIGTERM
RUN mkdir -p /var/log/postgres/ \
    && touch /var/log/postgres/postgresql.log \
    && chown -R postgres:postgres /var/log/postgres/
HEALTHCHECK --interval=360s --timeout=3s --start-period=15s --start-interval=1s --retries=5 \
    CMD pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER} || exit 1
EXPOSE 5432/tcp

FROM base AS dev
CMD [ "postgres", "-c", "maintenance_work_mem=512MB", "-c", "logging_collector=on", "-c", "log_directory=/var/log/postgres/", "-c", "log_filename=postgresql.log", "-c", "log_statement=all", "-c", "log_duration=1", "-c", "log_min_duration_statement=100", "-c", "log_destination=jsonlog", "-c", "log_rotation_age=1d", "-c", "log_rotation_size=10MB" ]

FROM base AS prod
LABEL org.opencontainers.image.title="Notes DB" \
      org.opencontainers.image.description="Human-readable description of the software packaged in the image (string)" \
      org.opencontainers.image.authors="https://github.com/Kallenju" \
      org.opencontainers.image.url="https://github.com/Kallenju/notes" \
      org.opencontainers.image.documentation="https://github.com/Kallenju/notes" \
      org.opencontainers.image.source="https://github.com/Kallenju/notes"
CMD [ "postgres", "-c", "maintenance_work_mem=512MB", "-c", "logging_collector=on", "-c", "log_directory=/var/log/postgres/", "-c", "log_filename=postgresql.log", "-c", "log_destination=jsonlog", "-c", "log_rotation_age=1d", "-c", "log_rotation_size=10MB" ]
