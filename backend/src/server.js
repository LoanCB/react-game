import chalk from "chalk";
//pour fastify
import cors from "@fastify/cors";
import fastifyJWT from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
//routes
import { gamesRoutes } from "./routes/games.js";
import { usersRoutes } from "./routes/users.js";
//bdd
import socketioServer from "fastify-socket.io";
import { sequelize } from "./bdd.js";
import socketHandler from "./socket.js";

//Test de la connexion
try {
  sequelize.authenticate();
  console.log(chalk.grey("Connecté à la base de données MySQL!"));
} catch (error) {
  console.error("Impossible de se connecter, erreur suivante :", error);
}

const CHECK_INTERVAL = process.env.CHECK_GAMES || 10000;

/**
 * API
 * avec fastify
 */
let blacklistedTokens = [];
const app = fastify({ logger: true });
//Ajout du plugin fastify-bcrypt pour le hash du mdp
await app
  .register(fastifyBcrypt, {
    saltWorkFactor: 12,
  })
  .register(cors, {
    origin: "*",
  })
  .register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Documentation de l'API Skulls",
        description:
          "API développée pour un exercice avec React avec Fastify et Sequelize",
        version: "0.1.0",
      },
    },
  })
  .register(fastifySwaggerUi, {
    routePrefix: "/documentation",
    theme: {
      title: "Docs - Skulls API",
    },
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (_request, _reply, next) {
        next();
      },
      preHandler: function (_request, _reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  })
  .register(fastifyJWT, {
    secret: "unanneaupourlesgouvernertous",
  })
  .register(socketioServer, {
    cors: {
      origin: "*",
    },
  });

/**********
 * Routes
 **********/
app.get("/", (request, reply) => {
  reply.send({ documentationURL: "http://localhost:3000/documentation" });
});
// Fonction pour décoder et vérifier le token
app.decorate("authenticate", async (request, reply) => {
  try {
    const token = request.headers["authorization"].split(" ")[1];

    // Vérifier si le token est dans la liste noire
    if (blacklistedTokens.includes(token)) {
      return reply.status(401).send({ error: "Token invalide ou expiré" });
    }
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});
//gestion utilisateur
usersRoutes(app, blacklistedTokens);
//gestion des jeux
gamesRoutes(app);

/**********
 * START
 **********/
socketHandler(app);

const start = async () => {
  try {
    await sequelize
      .sync({ alter: true })
      .then(() => {
        console.log(chalk.green("Base de données synchronisée."));
      })
      .catch((error) => {
        console.error(
          "Erreur de synchronisation de la base de données :",
          error
        );
      });
    await app.listen({ port: 3000 });
    console.log(
      "Serveur Fastify lancé sur " + chalk.blue("http://localhost:3000")
    );
    console.log(
      chalk.bgYellow(
        "Accéder à la documentation sur http://localhost:3000/documentation"
      )
    );

    // setInterval(() => checkGames(app), CHECK_INTERVAL);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
