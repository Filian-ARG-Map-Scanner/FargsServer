FROM node:22.23.2 as base
ARG VERSION
ENV VERSION=$VERSION
WORKDIR /usr/src/app
ENV NODE_ENV=production
LABEL authors="bibby"
COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

FROM base as devdeps
RUN yarn install --frozen-lockfile --production=false

FROM devdeps as build
COPY --chown=node:node tsconfig.* ./
COPY --chown=node:node nest-cli.json ./
COPY --chown=node:node src/ ./src
RUN yarn build
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=SENTRY_ORG,env=SENTRY_ORG \
    --mount=type=secret,id=SENTRY_PROJECT,env=SENTRY_PROJECT \
    yarn run sentry:sourcemaps

FROM base as prodeps
RUN yarn install --frozen-lockfile --production=true

FROM base as final
COPY --from=prodeps --chown=node:node node_modules/ ./node_modules
COPY --from=build --chown=node:node dist/ ./dist
ENTRYPOINT ["yarn", "run", "start:dev"]