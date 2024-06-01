#!/bin/sh

set -e

source "/home/task-manager/tasks/environment"

if [ -z "${PRODUCTION}" ]; then
    echo "You need to set PRODUCTION environment variable."
    exit 1
fi

echo "PRODUCTION: ${PRODUCTION}"

if [ -z "${BACKUP_KEEP_DAYS}" ]; then
    echo "You need to set BACKUP_KEEP_DAYS environment variable."
    exit 1
fi

echo "BACKUP_KEEP_DAYS: ${BACKUP_KEEP_DAYS}"

if [ -z "${NOTES_POSTGRES_HOST}" ] || \
   [ -z "${NOTES_POSTGRES_PORT}" ] || \
   [ -z "${NOTES_POSTGRES_DATABASE}" ] || \
   [ -z "${NOTES_POSTGRES_USER}" ] || \
   [ -z "${NOTES_POSTGRES_PASSWORD}" ]; then
    echo "You need to set PostgreSQL environment variables."
    exit 1
fi

# Initialize dirs
mkdir -p "/var/opt/pgbackups/"
DBFILE="/var/opt/pgbackups/${NOTES_POSTGRES_DATABASE}-$(date +'%Y-%m-%d-%H-%M-%S').dump"
echo "DB backup file will be store in ${DBFILE}"

# Create dump
echo "Creating dump of ${NOTES_POSTGRES_DATABASE} database inside of ${NOTES_POSTGRES_HOST} container ..."

if [ "${PRODUCTION}" = "false" ]; then
    export PGPASSWORD="${NOTES_POSTGRES_PASSWORD}"
else
    export PGPASSWORD=$(cat "${NOTES_POSTGRES_PASSWORD}")
fi

pg_dump -Fc -Z 9 -h "${NOTES_POSTGRES_HOST}" -p "${NOTES_POSTGRES_PORT}" -U "${NOTES_POSTGRES_USER}" -d "${NOTES_POSTGRES_DATABASE}" -f "${DBFILE}"

# Clean old files
echo "Cleaning backups older than ${BACKUP_KEEP_DAYS} days ..."
find "/var/opt/pgbackups/" -maxdepth 1 -mtime +${BACKUP_KEEP_DAYS} -name "${DB}-*.sql*" -exec rm -rf '{}' ';'

echo "SQL backup uploaded successfully"
