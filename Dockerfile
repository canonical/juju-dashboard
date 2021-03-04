# syntax=docker/dockerfile:experimental

FROM node:12-slim
WORKDIR /srv
ADD package.json .
ADD yarn.lock .
ADD serve.json .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install
ADD . .
RUN yarn run build
RUN yarn global add serve
# The serve.json file contains the configuration options for this server
ENTRYPOINT ["serve -l 80"]
