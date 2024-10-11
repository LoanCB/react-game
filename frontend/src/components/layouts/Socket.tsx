import { createContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | null>(null);
const newSocket = io(import.meta.env.VITE_API_BASE_URL);

const SocketProvider = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    setSocket(newSocket);
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      <Outlet />
    </SocketContext.Provider>
  );
};

export default SocketProvider;
