FROM node:12.13-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

ENV TZ Europe/Moscow

CMD ['npm', 'run', 'dev']
