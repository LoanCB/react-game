import { Op } from "sequelize";
import { sequelize } from "../bdd.js";
import Disc from "../models/disks.js";
import Game, { GamePlayers } from "../models/games.js";
import User from "../models/users.js";

const gameLogic = {
  async createGame(creatorId) {
    if (!creatorId) {
      return { error: "L'identifiant du créateur est manquant", code: 400 };
    }

    const game = await Game.create({
      creator: creatorId,
      state: "pending",
    });

    await GamePlayers.create({
      gameId: game.id,
      userId: creatorId,
      order: 1,
    });
    return game;
  },

  async joinGame(gameId, userId) {
    const game = await Game.findByPk(gameId);
    if (!game) {
      //  || ["pending", "paused"].includes(game.state)
      throw new Error("Game not available to join");
    }
    const { rows: players, count: playerCount } =
      await GamePlayers.findAndCountAll({ where: { gameId } });
    const alreadyPlayer = players.find(
      (player) => player.dataValues.userId === userId
    );
    if (alreadyPlayer) {
      if (!alreadyPlayer.dataValues.isActive) {
        await GamePlayers.update(
          { isActive: true },
          {
            where: { gameId, userId },
          }
        );
      }
      return alreadyPlayer;
    }

    return await GamePlayers.create({
      gameId,
      userId,
      order: playerCount + 1,
    });
  },

  async updateConnectedUser(gameId, app) {
    const connectedSockets = app.io.sockets.adapter.rooms.get(gameId);
    const ids = Array.from(connectedSockets || []).map(
      (socketId) => app.io.sockets.sockets.get(socketId).userId
    );

    await GamePlayers.update({ isActive: false }, { where: { gameId } });

    if (ids.length > 0) {
      await GamePlayers.update(
        { isActive: true },
        {
          where: {
            gameId,
            userId: {
              [Op.in]: ids,
            },
          },
        }
      );
    }

    const gameState = await gameLogic.getGameState(gameId);
    app.io.to(gameId).emit("gameStateUpdate", gameState);
  },

  async startGame(gameId) {
    const game = await Game.findByPk(gameId);
    if (!game || game.state !== "pending") {
      throw new Error("Game cannot be started");
    }

    const players = await GamePlayers.findAll({ where: { gameId } });
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

  async nextPlayer({ game, gameId, userId }) {
    const nextPlayer = await GamePlayers.findOne({
      where: {
        gameId,
        order: {
          [Op.gt]: (
            await GamePlayers.findOne({ where: { gameId, userId } })
          ).order,
        },
      },
      order: [["order", "ASC"]],
    });
    await game.update({
      currentPlayerId: nextPlayer
        ? nextPlayer.userId
        : (
            await GamePlayers.findOne({
              where: { gameId },
              order: [["order", "ASC"]],
            })
          ).userId,
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
    await this.nextPlayer({ game, gameId, userId });
  },

  async makeBet(gameId, userId, betAmount) {
    const game = await Game.findByPk(gameId);
    const discsPlaced = await Disc.count({
      where: {
        gameId,
        position: { [Op.ne]: null },
      },
    });

    if (
      game.state !== "playing" ||
      game.currentPlayerId !== userId ||
      betAmount <= game.currentBet ||
      betAmount > discsPlaced
    ) {
      throw new Error("Invalid bet");
    }
    await game.update({ currentBet: betAmount });

    // Pass bet for other players if max amount of discs are chosen
    if (betAmount === discsPlaced) {
      await GamePlayers.update(
        { passBet: true },
        { where: { gameId, userId: { [Op.ne]: game.currentPlayerId } } }
      );
    } else {
      // Move to next player
      await this.nextPlayer({ game, gameId, userId });
    }
  },

  async passBet(gameId, userId) {
    const gamePlayer = await GamePlayers.findOne({
      where: { gameId, userId },
      include: [
        {
          model: Game,
          as: "game",
          attributes: ["state", "currentPlayerId"],
        },
      ],
    });

    if (
      gamePlayer.game.state !== "playing" ||
      gamePlayer.game.currentPlayerId !== userId ||
      gamePlayer.passBet
    ) {
      throw new Error("Invalid passing bet");
    }

    await gamePlayer.update({ passBet: true });

    // Move to next player
    const game = await Game.findByPk(gameId);
    await this.nextPlayer({ game, gameId, userId });
  },

  async revealDisc(gameId, userId, discId) {
    const game = await Game.findByPk(gameId);
    if (game.state !== "playing") {
      throw new Error("Game is not in playing state");
    }

    const disc = await Disc.findOne({
      where: { id: discId },
      include: [{ model: User }],
    });

    if (!disc) {
      throw new Error("No disc at this position");
    }

    await disc.update({ isRevealed: true });

    if (disc.type === "skull") {
      // Player loses a disc
      const userDiscs = await Disc.findAll({
        where: { gameId, userId },
        attributes: ["id"],
      });
      const toDeleteDisc =
        userDiscs[Math.floor(Math.random() * userDiscs.length)];
      await Disc.destroy({ where: { id: toDeleteDisc.id } });

      if (userDiscs.length === 1) {
        await GamePlayers.update({ eliminated: true }, { where: { userId } });
        const alivePlayers = await GamePlayers.findAll({
          where: { gameId, eliminated: false },
          attributes: ["userId"],
        });
        if (alivePlayers.length === 1) {
          await this.endGame(gameId, alivePlayers[0].userId, "elimination");
        }
      }

      await Game.update({ state: "endRound" }, { where: { id: gameId } });
    } else {
      // Check if bet is completed
      const revealedCount = await Disc.count({
        where: { gameId, isRevealed: true, type: "flower" },
      });
      if (revealedCount === game.currentBet) {
        // Player wins the round
        const gamePlayers = await GamePlayers.findOne({
          where: { gameId, userId },
        });
        await gamePlayers.increment("score");
        if (gamePlayers.score === 1) {
          await this.endGame(gameId, userId, "score");
        } else {
          await Game.update({ state: "endRound" }, { where: { id: gameId } });
        }
      }
    }
  },

  async resetRound(gameId, userId) {
    await GamePlayers.update(
      { resetRound: true },
      { where: { gameId, userId } }
    );

    const players = await GamePlayers.findAll({
      where: { gameId },
      attributes: ["resetRound"],
    });

    if (players.length === 0 || !players.every((player) => player.resetRound)) {
      return;
    }

    // Reset Discs
    const discs = await Disc.update(
      { isRevealed: false, position: null },
      { where: { gameId } }
    );
    const game = await Game.findByPk(gameId);

    await game.update({ state: "playing" });

    // Reset player passing bet
    await GamePlayers.update(
      { passBet: false, resetRound: false },
      { where: { gameId } }
    );

    const currentPlayerDiscs = discs.filter(
      (disc) => disc.userId === game.currentPlayerId
    );
    const nextPlayer =
      currentPlayerDiscs.length === 0
        ? await GamePlayers.findOne({
            where: {
              gameId,
              order: {
                [Op.gt]: (
                  await GamePlayers.findOne({
                    where: { gameId, userId: game.currentPlayerId },
                  })
                ).order,
              },
            },
            order: [["order", "ASC"]],
          })
        : GamePlayers.findOne({ where: { userId: game.currentPlayerId } });
    await game.update({
      currentPlayerId: nextPlayer
        ? nextPlayer.userId
        : (
            await GamePlayers.findOne({
              where: { gameId },
              order: [["order", "ASC"]],
            })
          ).userId,
      currentBet: 0,
    });
  },

  async endGame(gameId, winnerId, victoryType) {
    const game = await Game.findByPk(gameId);
    await game.update({ state: "finished", winnerId, victoryType });
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
          through: {
            attributes: ["order", "score", "isActive", "passBet", "resetRound"],
          },
        },
      ],
    });

    if (!game) {
      throw new Error("Game not found");
    }

    // Pause game if a player is inactive
    if (
      game.players.some((player) => !player.game_players.isActive) &&
      game.state === "playing"
    ) {
      await game.update({ state: "paused" });
    }

    const rawDiscs = await Disc.findAll({
      where: { gameId },
      attributes: ["id", "type", "position", "isRevealed", "userId"],
      order: [["position", "DESC"]],
    });

    const cleanDiscs = (dirtyDiscs) => {
      const discs = [];
      for (let i = 0; i < dirtyDiscs.length; i++) {
        const disc = dirtyDiscs[i];
        if (disc.position) {
          if (i === 0) {
            discs.unshift({
              ...disc.dataValues,
              canReveal: !disc.dataValues.isRevealed,
            });
          } else {
            const previousDisc = discs[discs.length - 1];

            if (previousDisc.isRevealed) {
              discs.unshift({
                ...disc.dataValues,
                canReveal: !disc.dataValues.isRevealed,
              });
            } else {
              discs.unshift({ ...disc.dataValues, canReveal: false });
            }
          }
        } else {
          discs.push({ ...disc.dataValues, canReveal: false });
        }
      }
      return discs;
    };

    const discCounters = rawDiscs.reduce(
      (acc, cur) => {
        if (cur.position !== null) {
          acc.placed++;
        }
        if (cur.revealed) {
          acc.revealed++;
        }
        return acc;
      },
      { placed: 0, revealed: 0 }
    );

    return {
      id: game.id,
      state: game.state,
      currentPlayerId: game.currentPlayerId,
      currentBet: game.currentBet,
      canRevealOtherDisc: !cleanDiscs(
        rawDiscs.filter((disc) => disc.userId === game.currentPlayerId)
      ).some((disc) => disc.canReveal),
      winnerId: game.winnerId,
      creator: game.creatorPlayer,
      discsPlaced: discCounters.placed,
      discsRevealed: discCounters.revealed,
      playersResetRound: game.players.filter(
        (player) => player.game_players.resetRound
      ).length,
      players: game.players.map((player) => ({
        id: player.id,
        username: player.username,
        order: player.game_players.order,
        score: player.game_players.score,
        isActive: player.game_players.isActive,
        passBet: player.game_players.passBet,
        resetRound: player.game_players.resetRound,
        discs: cleanDiscs(rawDiscs.filter((disc) => disc.userId === player.id)),
      })),
    };
  },

  async handleDisconnection(gameId, userId) {
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    const GamePlayers = await GamePlayers.findOne({
      where: { gameId, userId },
    });
    if (!GamePlayers) {
      throw new Error("Player not found in game");
    }

    // Pause the game
    await game.update({ state: "paused" });

    // If the disconnected player is the creator, assign the next player as creator
    if (game.creatorId === userId) {
      const nextPlayer = await GamePlayers.findOne({
        where: { gameId, userId: { [Op.ne]: userId } },
        order: [["order", "ASC"]],
      });
      if (nextPlayer) {
        await game.update({ creatorId: nextPlayer.userId });
      }
    }

    // Update player status
    await GamePlayers.update({ isActive: false });

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

    await GamePlayers.destroy({ where: { gameId, userId: playerIdToRemove } });
    await Disc.destroy({ where: { gameId, userId: playerIdToRemove } });

    // Reorder remaining players
    const remainingPlayers = await GamePlayers.findAll({
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

    if (game.creator !== requestingUserId) {
      throw new Error("Only the game creator can resume the game");
    }

    const activePlayers = await GamePlayers.count({
      where: { gameId, isActive: true },
    });
    if (activePlayers < 2) {
      throw new Error("Not enough active players to resume the game");
    }

    await game.update({ state: "playing" });
  },
};

export default gameLogic;
