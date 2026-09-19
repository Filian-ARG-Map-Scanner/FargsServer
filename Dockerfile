FROM node:22.23.2 as BASE
ARG VERSION
ENV VERSION=$VERSION
WORKDIR /usr/src/app
ENV NODE_ENV=production
LABEL authors="bibby"
COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

FROM BASE as DEVDEPS
RUN yarn install --frozen-lockfile --production=false

FROM DEVDEPS as BUILD
COPY --chown=node:node tsconfig.* ./
COPY --chown=node:node nest-cli.json ./
COPY --chown=node:node src/ ./src
RUN yarn build
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=SENTRY_ORG,env=SENTRY_ORG \
    --mount=type=secret,id=SENTRY_PROJECT,env=SENTRY_PROJECT \
    yarn run sentry:sourcemaps

FROM BASE as PRODDEPS
RUN yarn install --frozen-lockfile --production=true

FROM BASE as FINAL
COPY --from=PRODDEPS --chown=node:node node_modules/ ./node_modules
COPY --from=BUILD --chown=node:node dist/ ./dist
ENTRYPOINT ["yarn", "run", "start:dev"]