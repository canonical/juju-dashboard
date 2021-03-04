# syntax=docker/dockerfile:experimental

FROM node:12-slim
WORKDIR /srv
ADD package.json .
ADD yarn.lock .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install
ADD . .
RUN yarn run build
RUN yarn global add serve
ENTRYPOINT ["serve", "-l", "80", "-s", "build"]
