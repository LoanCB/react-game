import { createGame, getGames, updateGame } from "../controllers/games.js";
export function gamesRoutes(app) {
  //création d'un jeu
  app.post(
    "/game",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      reply.send(await createGame(request.body.userId));
    }
  );
  //rejoindre un jeu
  app.patch(
    "/game/:action/:gameId",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      reply.send(await updateGame(request));
    }
  );

  // Liste des parties publics
  app.get(
    "/game",
    { preHandler: [app.authenticate] },
    async (_request, reply) => {
      reply.send(await getGames());
    }
  );
}
