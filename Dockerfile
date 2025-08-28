# syntax=docker/dockerfile:experimental

# Build stage: Install yarn dependencies
# ===
FROM node:22 AS yarn-dependencies

WORKDIR /srv

COPY .yar[n] ./.yarn
COPY package.json yarn.lock .yarnrc.yml ./
ARG HTTP_PROXY
RUN if [ -n "$HTTP_PROXY" ]; then \
      yarn config set httpProxy $HTTP_PROXY; \
    fi
ARG HTTPS_PROXY
RUN if [ -n "$HTTPS_PROXY" ]; then \
      yarn config set httpsProxy $HTTPS_PROXY; \
    fi
RUN yarn install

# Build stage: Run "yarn run build-js"
# ===
FROM yarn-dependencies AS build-js
ADD . .
ARG BUILD_ID
RUN if [ -n "$BUILD_ID" ]; then \
      cp public/config.demo.js public/config.js; \
    fi
RUN yarn run build

FROM ubuntu:noble

RUN apt update && apt install --yes nginx python3-jinja2

WORKDIR /srv

COPY ./charms/k8s-charm/src/config.js.j2 .
COPY ./charms/k8s-charm/src/nginx.conf.j2 .
COPY ./charms/k8s-charm/src/config.py .
COPY entrypoint entrypoint
COPY --from=build-js /srv/build .

ENTRYPOINT ["./entrypoint"]
