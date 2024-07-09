# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.13.1

FROM node:${NODE_VERSION}-alpine AS base
RUN mkdir -p /var/log/frontend-server/ \
    && chown -R node:node /var/log/frontend-server/
VOLUME /var/log/frontend-server/

FROM base AS dev
WORKDIR /usr/app/frontend-server/
COPY package.json package-lock.json /usr/app/frontend-server/
RUN npm ci
COPY .swcrc tsconfig.json nodemon.json /usr/app/frontend-server/
COPY ./src/ /usr/app/frontend-server/src/
VOLUME /var/log/frontend-server/ /usr/app/frontend-server/src/ /usr/app/frontend/public/ /usr/app/frontend/views/
EXPOSE 3000/tcp 9929/tcp
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=360s --timeout=3s --start-period=15s --start-interval=1s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:3000/healthcheck || exit 1
CMD ["node", "./node_modules/nodemon/bin/nodemon.js", "--config", "./nodemon.json"]

FROM base AS production-build
USER node
WORKDIR /usr/app/frontend-server/
COPY --chown=node:node package.json package-lock.json /usr/app/frontend-server/
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node .swcrc  tsconfig.json /usr/app/frontend-server/
COPY --chown=node:node ./src/ /usr/app/frontend-server/src/
RUN npm run build

FROM base AS prod
USER root
RUN mkdir -p /usr/app/frontend/ \
  && chown -R node:node /usr/app/frontend/
USER node
LABEL org.opencontainers.image.title="Notes Frontend Server" \
      org.opencontainers.image.description="Notes Frontend Server" \
      org.opencontainers.image.authors="https://github.com/Kallenju" \
      org.opencontainers.image.url="https://github.com/Kallenju/notes" \
      org.opencontainers.image.documentation="https://github.com/Kallenju/notes" \
      org.opencontainers.image.source="https://github.com/Kallenju/notes"
WORKDIR /usr/app/frontend-server/
COPY --chown=node:node --from=production-build /usr/app/frontend-server/node_modules/ /usr/app/frontend-server/node_modules/
COPY --chown=node:node package.json /usr/app/frontend-server/
COPY --chown=node:node --from=production-build /usr/app/frontend-server/dist/ /usr/app/frontend-server/dist/
EXPOSE 3000/tcp 9929/tcp
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=360s --timeout=3s --start-period=15s --start-interval=1s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:3000/healthcheck || exit 1
CMD ["node", "./dist/index.js"]


