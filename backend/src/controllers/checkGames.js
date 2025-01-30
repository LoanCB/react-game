import Game, { GamePlayers } from "../models/games.js";
import User from "../models/users.js";

const INACTIVE_THRESHOLD = 5 * 60 * 1000;

async function checkGames(app) {
  console.log("Running periodic game check...");

  // Récupérer toutes les parties dans les états 'pending', 'paused', ou 'playing'
  const games = await Game.findAll({
    where: {
      state: "pending",
    },
    include: [
      {
        model: User,
        as: "players",
        through: { attributes: ["isActive", "updatedAt"] },
      },
    ],
  });

  const now = new Date();

  for (const game of games) {
    const roomId = game.id;

    // Récupérer tous les sockets connectés dans la room
    const connectedSockets = await app.io.in(roomId).fetchSockets();
    const connectedPlayerIds = connectedSockets.map((socket) => socket.userId);

    // Vérifier chaque joueur de la partie
    const players = game.players; // Les joueurs sont inclus via Sequelize
    let hasActivePlayers = false;

    for (const player of players) {
      const isConnected = connectedPlayerIds.includes(player.id);

      if (!isConnected) {
        // Si le joueur n'est pas connecté, mettre isActive à false
        await GamePlayers.update(
          { isActive: false },
          {
            where: { gameId: roomId, userId: player.id },
          }
        );

        console.log(`Player ${player.id} marked as inactive in game ${roomId}`);
      } else {
        // Si le joueur est connecté, mettre isActive à true
        await GamePlayers.update(
          { isActive: true },
          {
            where: { gameId: roomId, userId: player.id },
          }
        );
        hasActivePlayers = true;
      }
    }

    // Vérifier si la partie doit être supprimée (aucun joueur actif)
    if (!hasActivePlayers) {
      const lastUpdatedAt = new Date(game.updatedAt); // Date de la dernière mise à jour
      if (now - lastUpdatedAt > INACTIVE_THRESHOLD) {
        console.log(`Deleting game ${roomId} due to inactivity...`);
        await Game.destroy({ where: { id: roomId } });
        app.io.to(roomId).emit("gameDeleted", { gameId: roomId });
      }
    }
  }
}

export default checkGames;
