FROM node:22.23.2
ARG VERSION
ENV VERSION=$VERSION
WORKDIR /usr/src/app
ENV NODE_ENV=production
LABEL authors="bibby"
COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./
COPY --chown=node:node node_modules/ ./node_modules
COPY --chown=node:node dist/ ./dist
ENTRYPOINT ["yarn", "run", "start:dev"]