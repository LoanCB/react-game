import { Button } from "@mui/material";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL);

const Game = () => {
  const { gameId } = useParams();

  const handleSendMessage = (message: string) => {
    console.log(message);
    socket.emit("sendMessage", { gameId, message });
  };

  useEffect(() => {
    console.log("demande join");

    socket.emit("joinGame", gameId);

    socket.on("message", (data) => {
      console.log("Message from server:", data);
    });

    return () => {
      socket.off("joinGame");
      socket.off("message");
    };
  }, []);

  return (
    <>
      <Button onClick={() => handleSendMessage("Test front :)")}>
        Envoyer un message
      </Button>
    </>
  );
};

export default Game;
