import { Op } from "sequelize";
import Game, { GamePlayers } from "../models/games.js";
import User from "../models/users.js";

export async function getGames(userId) {
  const games = await Game.findAll({
    where: {
      state: {
        [Op.in]: ["pending", "paused"],
      },
    },
    include: [
      {
        model: User,
        as: "players",
        through: {
          model: GamePlayers,
          attributes: ["isActive", "userId"],
        },
        attributes: ["id", "username"],
      },
    ],
  });

  // Filtering results
  const filteredGames = games.filter((game) => {
    return (
      (game.state === "pending" && !game.private) ||
      (game.state === "paused" &&
        game.players.some((player) => player.userId === userId))
    );
  });

  return filteredGames;
}

export async function createGame(userId) {
  if (!userId) {
    return { error: "L'identifiant du joueur est manquant" };
  }
  const game = await Game.create({ creatorId: userId });

  // Add the creator as the first player
  await GamePlayers.create({
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
      await GamePlayers.create({
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

export async function getUserGameStats(userId) {
  try {
    // Récupérer les parties jouées par l'utilisateur
    const gamesPlayed = await GamePlayers.findAll({
      where: { userId },
      include: [
        {
          model: Game,
          attributes: ["id", "state", "winnerId", "victoryType", "creator"],
        },
      ],
    });

    // Calculer le nombre de parties créées
    const gamesCreated = await Game.count({
      where: { creator: userId },
    });

    // Calculer le nombre de parties gagnées
    const gamesWon = await Game.count({
      where: { winnerId: userId },
    });

    // Calculer le nombre de victoires par type
    const victoriesByType = await Game.findAll({
      where: { winnerId: userId },
      attributes: ["victoryType"],
    });

    const scoreVictories = victoriesByType.filter(
      (game) => game.victoryType === "score"
    ).length;
    const eliminationVictories = victoriesByType.filter(
      (game) => game.victoryType === "elimination"
    ).length;

    return {
      gamesPlayed: gamesPlayed.length,
      gamesCreated,
      gamesWon,
      scoreVictories,
      eliminationVictories,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw error;
  }
}
