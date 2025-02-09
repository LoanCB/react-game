import { Box, Button, Typography } from "@mui/material";
import { SocketContext } from "@src/components/layouts/Socket";
import { useAppSelector } from "@src/store/hooks";
import { RootState } from "@src/store/store";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface GameState {
  id: string;
  state: "pending" | "playing" | "paused" | "finished";
  currentPlayerId: string | null;
  currentBet: number;
  winnerId: string | null;
  discsPlaced: number;
  discsRevealed: number;
  creator: { id: string; username: string };
  players: Array<{
    id: string;
    username: string;
    order: number;
    score: number;
    isActive: boolean;
    discs: Array<{
      id: string;
      type: "flower" | "skull";
      position: number | null;
      isRevealed: boolean;
      userId: string;
    }>;
  }>;
}

const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const context = useContext(SocketContext);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const user = useAppSelector((state: RootState) => state.user);

  if (!user) {
    throw new Error("Cannot get connected user");
  }

  if (!context) {
    throw new Error("Cannot get socket context");
  }
  const socket = context.socket!;

  useEffect(() => {
    if (!socket || !user.id) return;

    socket.emit("joinGame", { gameId, userId: user.id });

    socket.on("gameStateUpdate", (newState: GameState) => {
      console.log("updated game state :");
      console.log(newState);
      setGameState(newState);
    });

    socket.on("error", (error: string) => {
      console.error("Error from server:", error);
      // You might want to show this error to the user
    });

    return () => {
      socket.off("gameStateUpdate");
      socket.off("error");
    };
  }, [gameId, socket, user]);

  useEffect(() => {
    return () => {
      handleLeaveGame();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartGame = () => {
    socket.emit("startGame", { gameId, userId: user.id });
  };

  const handlePlaceDisc = (discType: "flower" | "skull") => {
    socket.emit("placeDisc", { gameId, userId: user.id, discType });
  };

  const handleMakeBet = (betAmount: number) => {
    socket.emit("makeBet", { gameId, userId: user.id, betAmount });
  };

  const handlePassBet = () => {
    socket.emit("passBet", { gameId, userId: user.id });
  };

  const handleRevealDisc = (discPosition: number) => {
    socket.emit("revealDisc", { gameId, userId: user.id, discPosition });
  };

  const handleRemovePlayer = (playerIdToRemove: string) => {
    socket.emit("removePlayer", {
      gameId,
      playerIdToRemove,
      requestingUserId: user.id,
    });
  };

  const handleResumeGame = () => {
    socket.emit("resumeGame", { gameId, requestingUserId: user.id });
  };

  const handleLeaveGame = () => {
    if (socket) {
      socket.emit("leaveGame");
    }
  };

  const renderBetButtons = () => {
    if (!gameState) {
      return [];
    }
    const buttons = [];
    for (let i = 1; i < gameState?.discsPlaced + 1; i++) {
      buttons.push(
        <Button
          variant="contained"
          size="small"
          key={i + "betButton"}
          onClick={() => handleMakeBet(i)}
          disabled={
            i <= gameState.currentBet ||
            gameState.discsPlaced < gameState.players.length
          }
        >
          {i}
        </Button>
      );
    }
    return buttons;
  };

  if (!gameState) {
    return <Typography>Loading game...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4">Game: {gameId}</Typography>
      <Typography>Game State: {gameState.state}</Typography>
      <Typography>Current Player: {gameState.currentPlayerId}</Typography>
      <Typography>Current Bet: {gameState.currentBet}</Typography>

      {gameState.state === "pending" && gameState.creator.id === user.id && (
        <Button onClick={handleStartGame}>Start Game</Button>
      )}

      {gameState.state === "playing" &&
        gameState.currentPlayerId === user.id && (
          <>
            <Box>
              <Button
                onClick={() => handlePlaceDisc("flower")}
                disabled={gameState.currentBet > 0}
              >
                Place Flower
              </Button>
              <Button
                onClick={() => handlePlaceDisc("skull")}
                disabled={gameState.currentBet > 0}
              >
                Place Skull
              </Button>
            </Box>
            <Box>
              {renderBetButtons()}
              <Button
                onClick={() => handlePassBet()}
                disabled={gameState.currentBet == 0}
              >
                Pass Bet
              </Button>
            </Box>
          </>
        )}

      {gameState.state === "playing" && (
        <Box>
          {gameState.players.map((player) => (
            <Box key={player.id + "disk"}>
              <Typography>{player.username}</Typography>
              {player.discs.some((disc) => disc.position) ? (
                player.discs.map(
                  (disc, index) =>
                    disc.position && (
                      <Button
                        key={disc.id}
                        onClick={() => handleRevealDisc(index)}
                        disabled={disc.isRevealed}
                      >
                        Reveal Disc {index + 1}
                      </Button>
                    )
                )
              ) : (
                <Typography>No disc placed</Typography>
              )}
            </Box>
          ))}
        </Box>
      )}

      {gameState.state === "paused" && gameState.creator.id === user.id && (
        <>
          <Button
            onClick={handleResumeGame}
            disabled={gameState.players.some((player) => !player.isActive)}
          >
            Resume Game
          </Button>
          {gameState.players.map((player) => (
            <Button
              key={player.id}
              onClick={() => handleRemovePlayer(player.id)}
              disabled={player.id === user.id}
            >
              Remove {player.username}
            </Button>
          ))}
        </>
      )}

      <Typography variant="h5">Players:</Typography>
      {gameState.players.map((player) => (
        <Typography key={player.id}>
          {player.username} - Score: {player.score} -{" "}
          {player.isActive ? "Active" : "Inactive"}
        </Typography>
      ))}
    </Box>
  );
};

export default Game;
