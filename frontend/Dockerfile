# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.13.1

FROM node:${NODE_VERSION}-alpine as base

FROM base as dev
WORKDIR /usr/app/frontend/
COPY package.json package-lock.json /usr/app/frontend/
RUN npm ci
COPY rollup.config.js babel.config.js nodemon.docker.json /usr/app/frontend/
COPY ./src/ /usr/app/frontend/src/
VOLUME /usr/app/frontend/src/ /usr/app/frontend/public/
STOPSIGNAL SIGTERM
CMD ["node", "./node_modules/nodemon/bin/nodemon.js", "--config", "./nodemon.docker.json"]

FROM base AS production-build
USER node
WORKDIR /usr/app/frontend/
ENV NODE_ENV=production
COPY --chown=node:node package.json package-lock.json /usr/app/frontend/
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node rollup.config.js babel.config.js nodemon.docker.json /usr/app/frontend/
COPY --chown=node:node ./src/ /usr/app/frontend/src/
RUN npm run build

FROM base as prod
LABEL org.opencontainers.image.title="Notes Pet Frontend" \
      org.opencontainers.image.description="Notes Frontend" \
      org.opencontainers.image.authors="https://github.com/Kallenju" \
      org.opencontainers.image.url="https://github.com/Kallenju/notes" \
      org.opencontainers.image.documentation="https://github.com/Kallenju/notes" \
      org.opencontainers.image.source="https://github.com/Kallenju/notes"
WORKDIR /usr/app/frontend/
COPY --chown=node:node ./views/ /usr/app/frontend/views/
COPY --chown=node:node --from=production-build /usr/app/frontend/public/ /usr/app/frontend/public/
VOLUME /usr/app/frontend/views/ /usr/app/frontend/public/
