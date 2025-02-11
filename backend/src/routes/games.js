import gameLogic from "../controllers/gameLogic.js";
import { getGames, getUserGameStats } from "../controllers/games.js";
export function gamesRoutes(app) {
  //création d'un jeu
  app.post(
    "/game",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      reply.send(await gameLogic.createGame(request.body.userId));
    }
  );
  //rejoindre un jeu
  app.patch(
    "/game/:action/:gameId",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      reply.send(
        await gameLogic.joinGame(request.params.gameId, request.user.id)
      );
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

  // Stats
  app.get(
    "/game/stats",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      reply.send(await getUserGameStats(request.user.id));
    }
  );
}
