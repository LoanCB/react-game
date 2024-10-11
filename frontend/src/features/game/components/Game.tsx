import { Button } from "@mui/material";
import { SocketContext } from "@src/components/layouts/Socket";
import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";

const Game = () => {
  const { gameId } = useParams();
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("Cannot get socket context");
  }
  const socket = context.socket!;

  const handleSendMessage = (message: string) => {
    console.log(message);
    socket.emit("sendMessage", { gameId, message });
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinGame", gameId);

    socket.on("message", (data) => {
      console.log("Message from server:", data);
    });

    return () => {
      socket.off("joinGame");
      socket.off("message");
    };
  }, [gameId, socket]);

  return (
    <>
      <Button onClick={() => handleSendMessage("Test front :)")}>
        Envoyer un message
      </Button>
    </>
  );
};

export default Game;
