# syntax=docker/dockerfile:experimental

# Build stage: Install yarn dependencies
# ===
FROM node:12-slim AS yarn-dependencies
WORKDIR /srv
ADD package.json .
ADD yarn.lock .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install


# Build stage: Run "yarn run build-js"
# ===
FROM yarn-dependencies AS build-js
ADD . .
RUN yarn run build


# Build the production image
# ===
FROM ubuntu:focal

# Set up environment
ENV LANG C.UTF-8
WORKDIR /srv

RUN yarn global add serve

# Import code, build assets and mirror list
ADD . .
RUN rm -rf package.json yarn.lock
COPY --from=build-js /srv/build .

# Setup commands to run server
ENTRYPOINT ["serve"]
