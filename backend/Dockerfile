# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.20.2

FROM node:${NODE_VERSION}-alpine as base

FROM base as dev
WORKDIR /usr/app/backend/
COPY package.json package-lock.json /usr/app/backend/
RUN npm ci
COPY .swcrc  tsconfig.json nodemon.json /usr/app/backend/
COPY ./src/ /usr/app/backend/src/
VOLUME /var/log/backend/ /usr/app/backend/src/
EXPOSE 3000/tcp 9929/tcp
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=360s --timeout=3s --start-period=15s --start-interval=1s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:3000/api/healthcheck || exit 1
CMD ["node", "./node_modules/nodemon/bin/nodemon.js", "--config", "./nodemon.json"]

FROM base AS production-build
WORKDIR /usr/app/backend/
COPY package.json package-lock.json /usr/app/backend/
RUN npm ci --omit=dev && npm cache clean --force
COPY .swcrc tsconfig.json /usr/app/backend/
COPY ./src/ /usr/app/backend/src/
RUN npm run build

FROM base as prod
USER node
WORKDIR /usr/app/backend/
COPY --chown=node:node package.json /usr/app/backend/
COPY --chown=node:node --from=production-build /usr/app/backend/node_modules/ /usr/app/backend/node_modules/
COPY --chown=node:node --from=production-build /usr/app/backend/dist/ /usr/app/backend/dist/
VOLUME /var/log/backend/
EXPOSE 3000/tcp 9929/tcp
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=360s --timeout=3s --start-period=15s --start-interval=1s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:3000/api/healthcheck || exit 1
CMD ["node", "./dist/index.js"]
