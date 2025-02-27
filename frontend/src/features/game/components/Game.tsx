import { Box, Button, Chip, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { SocketContext } from "@src/components/layouts/Socket";
import { useAppSelector } from "@src/store/hooks";
import { RootState } from "@src/store/store";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DiscImage from "./DiscImage";

interface Disc {
  id: string;
  type: "flower" | "skull";
  position: number | null;
  isRevealed: boolean;
  userId: string;
  canReveal: boolean;
}

interface GameState {
  id: string;
  state: "pending" | "playing" | "endRound" | "paused" | "finished";
  currentPlayerId: string | null;
  currentBet: number;
  canRevealOtherDisc: boolean;
  winnerId: string | null;
  discsPlaced: number;
  discsRevealed: number;
  playersResetRound: number;
  creator: { id: string; username: string };
  players: Array<{
    id: string;
    username: string;
    order: number;
    score: number;
    isActive: boolean;
    passBet: boolean;
    resetRound: boolean;
    discs: Disc[];
  }>;
}

const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const context = useContext(SocketContext);
  const navigate = useNavigate();

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

  const handleRevealDisc = (discId: string) => {
    socket.emit("revealDisc", { gameId, userId: user.id, discId });
  };

  const handleResetRound = () => {
    socket.emit("resetRound", { gameId, userId: user.id });
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
            gameState.discsPlaced < gameState.players.length ||
            playerCanReveal
          }
          sx={{ flex: "1 1 50px" }}
        >
          {i}
        </Button>
      );
    }
    return (
      <Box display="flex" gap={1}>
        {buttons}
      </Box>
    );
  };

  if (!gameState) {
    return <Typography>Loading game...</Typography>;
  }

  const currentPlayer = gameState.players.find(
    (player) => player.id === user.id
  );

  // Check all players refuse to bet except one (so concerned player can reveal discs)
  const playerCanReveal =
    gameState.players.filter((player) => !player.passBet).length === 1;

  const PlayerInfoBox = styled(Box)({
    position: "absolute",
    top: "120px", // Adjust as needed
    right: "16px", // Adjust as needed
    backgroundColor: "#f0f0f0", // Light gray background
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)", // Subtle shadow
    zIndex: 2, // Ensure it's above other content
    textAlign: "center",
  });

  const HandArea = styled(Box)({
    backgroundColor: "#fff",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
    zIndex: 2,
    display: "flex",
    justifyContent: "center",
    gap: "16px",
  });

  return (
    <Box>
      {gameState.state === "pending" && (
        <Box
          sx={{
            position: "absolute",
            width: "98%",
            height: "85%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
            color: "white",
          }}
        >
          <Typography variant="h4">En attente de joueurs</Typography>
          {gameState.creator.id === user.id && (
            <Button
              onClick={handleStartGame}
              variant="contained"
              color="success"
              disabled={
                gameState.players.filter((player) => player.isActive).length ===
                1
              }
            >
              Lancer la partie
            </Button>
          )}
        </Box>
      )}

      {gameState.state === "paused" && (
        <Box
          sx={{
            position: "absolute",
            width: "98%",
            height: "85%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
            color: "white",
          }}
        >
          <Typography variant="h4">Jeu mis en pause</Typography>
          {gameState.creator.id === user.id && (
            <Button
              onClick={handleResumeGame}
              variant="contained"
              color="success"
              disabled={gameState.players.some((player) => !player.isActive)}
            >
              Reprendre la partie
            </Button>
          )}
        </Box>
      )}

      {gameState.state === "finished" && (
        <Box
          sx={{
            position: "absolute",
            width: "98%",
            height: "85%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
            color: "white",
          }}
        >
          <Typography variant="h4">Partie terminée</Typography>
          <Button
            onClick={() => navigate("/game/list")}
            variant="contained"
            color="success"
          >
            Revenir au menu
          </Button>
        </Box>
      )}

      {["playing", "endRound", "finished"].includes(gameState.state) &&
        gameState.currentPlayerId && (
          <PlayerInfoBox>
            {gameState.currentBet === 0 && (
              <Chip
                label="Pas de parie en cours"
                color="success"
                sx={{ mb: 1 }}
              />
            )}
            {gameState.currentBet > 0 && (
              <Chip
                label={gameState.currentBet + " fleurs pariées"}
                color="warning"
                sx={{ mb: 1 }}
              />
            )}
            <Typography variant="h6">Joueur en cours :</Typography>
            <Typography variant="subtitle1">
              {
                gameState.players.find(
                  (player) => player.id === gameState.currentPlayerId
                )!.username
              }
            </Typography>
            {gameState.currentPlayerId === user.id && (
              <Box mt={2}>
                <Typography variant="h6">Lancer un parie :</Typography>
                {renderBetButtons()}
                <Button
                  onClick={() => handlePassBet()}
                  disabled={gameState.currentBet == 0 || playerCanReveal}
                  color="error"
                  variant="contained"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Ne pas parier
                </Button>
              </Box>
            )}
            {gameState.state === "endRound" && (
              <Box mt={2}>
                <Typography variant="h6">Manche terminée</Typography>
                <Button
                  onClick={() => handleResetRound()}
                  disabled={
                    gameState.players.find((player) => player.id === user.id)!
                      .resetRound
                  }
                  color="success"
                  variant="contained"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  {gameState.players.find((player) => player.id === user.id)!
                    .resetRound
                    ? `${gameState.playersResetRound} joueur(s) sur ${gameState.players.length}`
                    : "Finir la manche"}
                </Button>
              </Box>
            )}
          </PlayerInfoBox>
        )}

      {["playing", "paused", "endRound", "finished"].includes(
        gameState.state
      ) && (
        <Box display="flex" flexDirection="column" gap={2} ml={1}>
          {gameState.players.map((player) => (
            <Box key={player.id + "playerBase"}>
              <Typography variant="h6">
                {player.username}
                <Chip
                  label={player.score + " points"}
                  color="success"
                  size="small"
                  sx={{ ml: 1 }}
                />
                <Chip
                  label={player.discs.length + " disques"}
                  color="primary"
                  size="small"
                  sx={{ ml: 1 }}
                />
                {!player.isActive && (
                  <Chip
                    label="Joueur absent"
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Box display="flex" gap={2} position="relative">
                <DiscImage type="base" position={player.order} />
                {player.discs.map(
                  (disc, index) =>
                    disc.position && (
                      <>
                        {disc.isRevealed ? (
                          <DiscImage
                            type={disc.type}
                            position={player.order}
                            key={index + player.id + "disc-revealed"}
                          />
                        ) : (
                          <DiscImage
                            key={index + player.id + "disc-hidden"}
                            type="back"
                            position={player.order}
                            onClick={() => handleRevealDisc(disc.id)}
                            disabled={
                              !disc.canReveal ||
                              !playerCanReveal ||
                              gameState.currentPlayerId !== user.id ||
                              (!gameState.canRevealOtherDisc &&
                                gameState.currentPlayerId !== player.id)
                            }
                          />
                        )}
                      </>
                    )
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {["playing", "endRound"].includes(gameState.state) && currentPlayer && (
        <HandArea>
          {currentPlayer.discs.map(
            (disc) =>
              disc.position === null && (
                <Box
                  key={disc.id}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={2}
                >
                  <DiscImage
                    type={disc.type}
                    position={currentPlayer.order}
                    disabled={
                      gameState.currentPlayerId !== user.id ||
                      gameState.currentBet > 0
                    }
                    onClick={() => handlePlaceDisc(disc.type)}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={() => handlePlaceDisc(disc.type)}
                    disabled={
                      gameState.currentPlayerId !== user.id ||
                      gameState.currentBet > 0
                    }
                  >
                    Jouer la carte
                  </Button>
                </Box>
              )
          )}
        </HandArea>
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
              key={player.id + "playersListPaused"}
              onClick={() => handleRemovePlayer(player.id)}
              disabled={player.id === user.id}
            >
              Remove {player.username}
            </Button>
          ))}
        </>
      )}
    </Box>
  );
};

export default Game;
