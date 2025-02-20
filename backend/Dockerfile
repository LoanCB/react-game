FROM node:22
WORKDIR /app

COPY package*.json /app/

RUN npm clean-install
COPY ./src /app/src/
