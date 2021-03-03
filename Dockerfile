# syntax=docker/dockerfile:experimental

# Build stage: Install yarn dependencies
# ===
FROM node:12-slim AS yarn-dependencies
WORKDIR /srv
ADD package.json .
ADD yarn.lock .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install

FROM yarn-dependencies AS build-js
ADD . .
RUN yarn run build
RUN yarn global add serve

# Setup commands to run server
ENTRYPOINT ["serve"]
