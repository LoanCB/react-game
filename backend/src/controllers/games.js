import Game, { PlayerGame } from "../models/games.js";

export async function getGames() {
  return await Game.findAll({ where: { state: "pending", private: false } });
}

export async function createGame(userId) {
  if (!userId) {
    return { error: "L'identifiant du joueur est manquant" };
  }
  const game = await Game.create({ creatorId: userId });

  // Add the creator as the first player
  await PlayerGame.create({
    gameId: game.id,
    userId,
    order: 1,
  });

  return { gameId: game.id };
}

export async function updateGame(request) {
  const userId = request.body.userId;

  if (request.params.length < 2) {
    return { error: "Il manque des paramètres" };
  }

  const { action, gameId } = request.params;
  if (!userId) {
    return { error: "L'identifiant du joueur est manquant" };
  } else if (!gameId) {
    return { error: "L'identifiant de la partie est manquant" };
  }
  const game = await Game.findByPk(gameId);
  if (!game) {
    return { error: "La partie n'existe pas." };
  }

  if (game.dataValues.state === GameState.FINISHED) {
    return { error: "Cette partie est déjà terminée !" };
  }

  switch (action) {
    case "join":
      const playerCount = game.players.length;
      if (playerCount >= 6) {
        return {
          error:
            "Le nombre maximum de joueurs (6) est atteint pour cette partie !",
        };
      }
      if (game.dataValues.state != GameState.PENDING) {
        return { error: "Cette partie n'est plus en attente." };
      }

      if (game.players.some((player) => player.id === userId)) {
        return { error: "Vous êtes déjà dans cette partie.", code: 400 };
      }
      await PlayerGame.create({
        gameId: gameId,
        userId: userId,
        order: playerCount + 1,
      });
      break;
    case "start":
      if (game.players.length < 2) {
        return {
          error: "Il faut au moins 2 joueurs pour commencer la partie.",
        };
      }

      game.state = GameState.PLAYING;

      break;
    case "finish":
      game.state = GameState.FINISHED;
      if (!request.body.score) {
        return { error: "Le score est manquant." };
      }
      game.winnerScore = request.body.score;
      game.winnerId = request.body.winner;
      break;
    default:
      return { error: "Action inconnue" };
  }

  game.save();
  return game;
}
