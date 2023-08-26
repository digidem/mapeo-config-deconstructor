FROM node:slim

RUN mkdir -p /usr/src/app
RUN mkdir -p /tmp/bin

COPY . /tmp/bin
RUN cd /tmp/bin && npm i && npm install -g . --unsafe-perm
WORKDIR /usr/src/app

