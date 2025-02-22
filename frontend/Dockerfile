FROM node:22 AS build
WORKDIR /app

COPY package*.json .

RUN npm clean-install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app

RUN npm install -g serve@14.2.4
COPY --from=build /app/dist ./dist

ENV PORT=$PORT
EXPOSE $PORT

CMD ["sh", "-c", "serve -s dist -l $PORT"]
