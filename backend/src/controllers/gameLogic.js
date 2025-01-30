import { sequelize } from "../bdd.js";
import Disc from "../models/disks.js";
import Game, { PlayerGame } from "../models/games.js";
import User from "../models/users.js";

const gameLogic = {
  async createGame(creatorId) {
    const game = await Game.create({
      creatorId,
      state: "pending",
    });
    await PlayerGame.create({
      gameId: game.id,
      userId: creatorId,
      order: 1,
    });
    return game;
  },

  async joinGame(gameId, userId) {
    const game = await Game.findByPk(gameId);
    if (!game || game.state !== "pending") {
      throw new Error("Game not available to join");
    }
    const playerCount = await PlayerGame.count({ where: { gameId } });
    await PlayerGame.create({
      gameId,
      userId,
      order: playerCount + 1,
    });
  },

  async startGame(gameId) {
    const game = await Game.findByPk(gameId);
    if (!game || game.state !== "pending") {
      throw new Error("Game cannot be started");
    }

    const players = await PlayerGame.findAll({ where: { gameId } });
    if (players.length < 2) {
      throw new Error("Not enough players to start the game");
    }

    await sequelize.transaction(async (t) => {
      // Distribute discs to players
      for (const player of players) {
        for (let i = 0; i < 3; i++) {
          await Disc.create(
            {
              type: "flower",
              userId: player.userId,
              gameId,
            },
            { transaction: t }
          );
        }
        await Disc.create(
          {
            type: "skull",
            userId: player.userId,
            gameId,
          },
          { transaction: t }
        );
      }

      // Update game state
      await game.update(
        {
          state: "playing",
          currentPlayerId: players[0].userId,
        },
        { transaction: t }
      );
    });
  },

  async placeDisc(gameId, userId, discType) {
    const game = await Game.findByPk(gameId);
    if (game.state !== "playing" || game.currentPlayerId !== userId) {
      throw new Error("Invalid move");
    }

    const disc = await Disc.findOne({
      where: { gameId, userId, type: discType, position: null },
    });
    if (!disc) {
      throw new Error("No such disc available");
    }

    const position = await Disc.count({
      where: { gameId, userId, position: { [Op.not]: null } },
    });
    await disc.update({ position: position + 1 });

    // Move to next player
    const nextPlayer = await PlayerGame.findOne({
      where: {
        gameId,
        order: {
          [Op.gt]: (
            await PlayerGame.findOne({ where: { gameId, userId } })
          ).order,
        },
      },
      order: [["order", "ASC"]],
    });
    await game.update({
      currentPlayerId: nextPlayer
        ? nextPlayer.userId
        : (
            await PlayerGame.findOne({
              where: { gameId },
              order: [["order", "ASC"]],
            })
          ).userId,
    });
  },

  async makeBet(gameId, userId, betAmount) {
    const game = await Game.findByPk(gameId);
    if (
      game.state !== "playing" ||
      game.currentPlayerId !== userId ||
      betAmount <= game.currentBet
    ) {
      throw new Error("Invalid bet");
    }
    await game.update({ currentBet: betAmount });
  },

  async revealDisc(gameId, userId, discPosition) {
    const game = await Game.findByPk(gameId);
    if (game.state !== "playing") {
      throw new Error("Game is not in playing state");
    }

    const disc = await Disc.findOne({
      where: { gameId, position: discPosition },
      include: [{ model: User }],
    });

    if (!disc) {
      throw new Error("No disc at this position");
    }

    await disc.update({ isRevealed: true });

    if (disc.type === "skull") {
      // Player loses a disc
      await Disc.destroy({
        where: { gameId, userId: disc.User.id, position: null },
        limit: 1,
      });
      // Reset the game for next round
      await this.resetRound(gameId);
    } else {
      // Check if bet is completed
      const revealedCount = await Disc.count({
        where: { gameId, isRevealed: true, type: "flower" },
      });
      if (revealedCount === game.currentBet) {
        // Player wins the round
        const playerGame = await PlayerGame.findOne({
          where: { gameId, userId },
        });
        await playerGame.increment("score");
        if (playerGame.score === 2) {
          await this.endGame(gameId, userId);
        } else {
          await this.resetRound(gameId);
        }
      }
    }
  },

  async resetRound(gameId) {
    await Disc.update(
      { isRevealed: false, position: null },
      { where: { gameId } }
    );
    const game = await Game.findByPk(gameId);
    const nextPlayer = await PlayerGame.findOne({
      where: {
        gameId,
        order: {
          [Op.gt]: (
            await PlayerGame.findOne({
              where: { gameId, userId: game.currentPlayerId },
            })
          ).order,
        },
      },
      order: [["order", "ASC"]],
    });
    await game.update({
      currentPlayerId: nextPlayer
        ? nextPlayer.userId
        : (
            await PlayerGame.findOne({
              where: { gameId },
              order: [["order", "ASC"]],
            })
          ).userId,
      currentBet: 0,
    });
  },

  async endGame(gameId, winnerId) {
    const game = await Game.findByPk(gameId);
    await game.update({ state: "finished", winnerId });
  },

  async getGameState(gameId) {
    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: User,
          as: "creatorPlayer",
          attributes: ["id", "username"],
        },
        {
          model: User,
          as: "players",
          attributes: ["id", "username"],
          through: { attributes: ["order", "score", "isActive"] },
        },
      ],
    });

    if (!game) {
      throw new Error("Game not found");
    }

    const discs = await Disc.findAll({
      where: { gameId },
      attributes: ["id", "type", "position", "isRevealed", "userId"],
    });

    return {
      id: game.id,
      state: game.state,
      currentPlayerId: game.currentPlayerId,
      currentBet: game.currentBet,
      winnerId: game.winnerId,
      creator: game.creatorPlayer,
      players: game.players,
      discs: discs,
    };
  },

  async handleDisconnection(gameId, userId) {
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    const playerGame = await PlayerGame.findOne({ where: { gameId, userId } });
    if (!playerGame) {
      throw new Error("Player not found in game");
    }

    // Pause the game
    await game.update({ state: "paused" });

    // If the disconnected player is the creator, assign the next player as creator
    if (game.creatorId === userId) {
      const nextPlayer = await PlayerGame.findOne({
        where: { gameId, userId: { [Op.ne]: userId } },
        order: [["order", "ASC"]],
      });
      if (nextPlayer) {
        await game.update({ creatorId: nextPlayer.userId });
      }
    }

    // Update player status
    await playerGame.update({ isActive: false });

    return this.getGameState(gameId);
  },

  async removePlayer(gameId, playerIdToRemove, requestingUserId) {
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.creatorId !== requestingUserId) {
      throw new Error("Only the game creator can remove players");
    }

    await PlayerGame.destroy({ where: { gameId, userId: playerIdToRemove } });
    await Disc.destroy({ where: { gameId, userId: playerIdToRemove } });

    // Reorder remaining players
    const remainingPlayers = await PlayerGame.findAll({
      where: { gameId },
      order: [["order", "ASC"]],
    });

    for (let i = 0; i < remainingPlayers.length; i++) {
      await remainingPlayers[i].update({ order: i + 1 });
    }

    // If game was paused and there are enough players, resume the game
    if (game.state === "paused" && remainingPlayers.length >= 3) {
      await game.update({ state: "playing" });
    }

    // If the removed player was the current player, move to the next player
    if (game.currentPlayerId === playerIdToRemove) {
      const nextPlayer = remainingPlayers.find(
        (p) => p.userId !== playerIdToRemove
      );
      if (nextPlayer) {
        await game.update({ currentPlayerId: nextPlayer.userId });
      }
    }

    return this.getGameState(gameId);
  },

  async resumeGame(gameId, requestingUserId) {
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.creatorId !== requestingUserId) {
      throw new Error("Only the game creator can resume the game");
    }

    const activePlayers = await PlayerGame.count({
      where: { gameId, isActive: true },
    });
    if (activePlayers < 2) {
      throw new Error("Not enough active players to resume the game");
    }

    await game.update({ state: "playing" });

    return this.getGameState(gameId);
  },
};

export default gameLogic;
