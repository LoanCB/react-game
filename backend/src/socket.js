const socketHandler = (app) => {
  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log(`User connected : ${socket.id}`);

      // Join Room
      socket.on("joinGame", (gameId) => {
        socket.join(gameId);
        console.log(`User ${socket.id} joined room: ${gameId}`);
        socket
          .to(gameId)
          .emit("message", `User ${socket.id} joined the game room ${gameId}`);
      });

      // Room event
      socket.on("sendMessage", ({ gameId, message }) => {
        socket.to(gameId).emit("message", { user: socket.id, message });
        console.log(`Message sent to room ${gameId}:`, message);
      });

      // Disconnection
      socket.on("disconnect", () => {
        console.log(`User disconnected : ${socket.id}`);
      });
    });
  });
};

export default socketHandler;
