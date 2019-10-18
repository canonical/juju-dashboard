FROM ubuntu:bionic

# Set up environment
ENV LANG C.UTF-8

RUN apt-get update && apt-get install --yes nginx

# Set git commit ID
ARG REVISION_ID
RUN test -n "${REVISION_ID}"

# Copy over files
WORKDIR /srv
ADD build .
ADD nginx.conf /etc/nginx/sites-enabled/default
RUN sed -i "s/~REVISION_ID~/${REVISION_ID}/" /etc/nginx/sites-enabled/default
RUN sed -i "s/8036/80/" /etc/nginx/sites-enabled/default

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]

