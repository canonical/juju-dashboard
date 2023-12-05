# syntax=docker/dockerfile:experimental

# Build stage: Install yarn dependencies
# ===
FROM node:20 AS yarn-dependencies

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

FROM ubuntu:jammy

RUN apt update && apt install --yes nginx

WORKDIR /srv

COPY nginx.conf /etc/nginx/sites-available/default
COPY entrypoint entrypoint
COPY --from=build-js /srv/build .

ENTRYPOINT ["./entrypoint"]
