FROM node:22
WORKDIR /app

COPY package*.json /app/
COPY eslint.config.js /app/

RUN npm clean-install
COPY ./src /app/src/

ENV PORT=$PORT
EXPOSE $PORT

CMD ["node", "src/server.js"]
