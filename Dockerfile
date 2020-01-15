# syntax=docker/dockerfile:experimental


# Build stage: Build site
# ===
FROM node:12-slim AS build-site
WORKDIR /srv
ADD . .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install
RUN node_modules/.bin/craco build


# Build the production image
# ===
FROM ubuntu:bionic

# Set up environment
WORKDIR /srv
ENV LANG C.UTF-8
STOPSIGNAL SIGQUIT

# Install dependencies
RUN apt-get update && apt-get install --yes nginx

# Copy over files
COPY --from=build-site srv/build .

# Create nginx conf
ARG BUILD_ID
ADD nginx.conf /etc/nginx/sites-enabled/default
RUN sed -i "s/~BUILD_ID~/${BUILD_ID}/" /etc/nginx/sites-enabled/default

CMD ["nginx", "-g", "daemon off;"]
