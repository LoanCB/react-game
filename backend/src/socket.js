import gameLogic from "./controllers/gameLogic.js";
import { PlayerGame } from "./models/games.js";

const socketHandler = (app) => {
  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log(`User connected : ${socket.id}`);

      // Join Game
      socket.on("joinGame", async ({ gameId, userId }) => {
        try {
          await gameLogic.joinGame(gameId, userId);
          socket.join(gameId);
          console.log(`User ${userId} joined game: ${gameId}`);
          app.io.to(gameId).emit("playerJoined", { userId, gameId });

          // Fetch and send updated game state
          const gameState = await gameLogic.getGameState(gameId);
          app.io.to(gameId).emit("gameStateUpdate", gameState);
        } catch (error) {
          socket.emit("error", error.message);
        }
      });

      // Start Game
      socket.on("startGame", async ({ gameId, userId }) => {
        try {
          await gameLogic.startGame(gameId);
          console.log(`Game ${gameId} started by user ${userId}`);

          const gameState = await gameLogic.getGameState(gameId);
          app.io.to(gameId).emit("gameStarted", gameState);
        } catch (error) {
          socket.emit("error", error.message);
        }
      });

      // Place Disc
      socket.on("placeDisc", async ({ gameId, userId, discType }) => {
        try {
          await gameLogic.placeDisc(gameId, userId, discType);
          console.log(`User ${userId} placed a ${discType} in game ${gameId}`);

          const gameState = await gameLogic.getGameState(gameId);
          app.io.to(gameId).emit("discPlaced", gameState);
        } catch (error) {
          socket.emit("error", error.message);
        }
      });

      // Make Bet
      socket.on("makeBet", async ({ gameId, userId, betAmount }) => {
        try {
          await gameLogic.makeBet(gameId, userId, betAmount);
          console.log(`User ${userId} bet ${betAmount} in game ${gameId}`);

          const gameState = await gameLogic.getGameState(gameId);
          app.io.to(gameId).emit("betMade", gameState);
        } catch (error) {
          socket.emit("error", error.message);
        }
      });

      // Reveal Disc
      socket.on("revealDisc", async ({ gameId, userId, discPosition }) => {
        try {
          await gameLogic.revealDisc(gameId, userId, discPosition);
          console.log(
            `User ${userId} revealed disc at position ${discPosition} in game ${gameId}`
          );

          const gameState = await gameLogic.getGameState(gameId);
          app.io.to(gameId).emit("discRevealed", gameState);
        } catch (error) {
          socket.emit("error", error.message);
        }
      });

      // Chat message
      socket.on("sendMessage", ({ gameId, userId, message }) => {
        app.io.to(gameId).emit("message", { userId, message });
        console.log(
          `Message sent to game ${gameId} by user ${userId}:`,
          message
        );
      });

      // Disconnection
      socket.on("disconnect", async () => {
        console.log(`User disconnected : ${socket.id}`);

        // Find all games this user is part of
        const playerGames = await PlayerGame.findAll({
          where: { userId: socket.id },
        });

        for (const playerGame of playerGames) {
          try {
            const updatedGameState = await gameLogic.handleDisconnection(
              playerGame.gameId,
              socket.id
            );
            app.io
              .to(playerGame.gameId)
              .emit("playerDisconnected", updatedGameState);
          } catch (error) {
            console.error(
              `Error handling disconnection for game ${playerGame.gameId}:`,
              error
            );
          }
        }
      });

      // Remove player (only for game creator)
      socket.on(
        "removePlayer",
        async ({ gameId, playerIdToRemove, requestingUserId }) => {
          try {
            const updatedGameState = await gameLogic.removePlayer(
              gameId,
              playerIdToRemove,
              requestingUserId
            );
            app.io.to(gameId).emit("playerRemoved", updatedGameState);
          } catch (error) {
            socket.emit("error", error.message);
          }
        }
      );

      // Resume game (only for game creator)
      socket.on("resumeGame", async ({ gameId, requestingUserId }) => {
        try {
          const updatedGameState = await gameLogic.resumeGame(
            gameId,
            requestingUserId
          );
          app.io.to(gameId).emit("gameResumed", updatedGameState);
        } catch (error) {
          socket.emit("error", error.message);
        }
      });
    });
  });
};

export default socketHandler;
