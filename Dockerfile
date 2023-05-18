# syntax=docker/dockerfile:experimental

# Build stage: Install yarn dependencies
# ===
FROM node:20 AS yarn-dependencies

WORKDIR /srv

ADD package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install


# Build stage: Run "yarn run build-js"
# ===
FROM yarn-dependencies AS build-js
ADD . .
RUN yarn run build


FROM ubuntu:jammy

RUN apt update && apt install --yes nginx

WORKDIR /srv

COPY nginx.conf /etc/nginx/sites-available/default
COPY entrypoint entrypoint
COPY --from=build-js /srv/build .

ENTRYPOINT ["./entrypoint"]
