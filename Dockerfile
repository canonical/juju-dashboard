# syntax=docker/dockerfile:experimental

FROM ubuntu:focal
WORKDIR /srv
RUN apt update && \
    apt install curl --yes && \
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt update && \
    apt install nodejs --yes
RUN npm install -g yarn
RUN yarn global add serve
ADD package.json .
ADD yarn.lock .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install
ADD . .
RUN yarn run build
ENTRYPOINT ["serve", "-l", "80", "-s", "build"]
