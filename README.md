# Skull project

School project to learn websocket and React

## Technologies

### Backend

- Framework : Fastify in javascript
- ORM : Sequilize
- Database : MariaDB
- Websocket : Socket.io

### Frontend

- Librairie : React in typescript
- Global state : Context & Redux
- API communication : RTK query
- Forms : Formik & Yup
- Component librairy : Mui

## Production

### Backend

Using docker and docker image generate by github actions
example of docker-compose.yml :
```
services:
  skull-api:
    image: loancb/skull-api:unstable
    env_file:
      - .env
    ports:
      - "${PORT}:${PORT}"
    network_mode: "host"
```

### Frontend
Using Vercel
