"use client";

import { createContext, useContext } from "react";
import { socket } from "@/lib/socket/client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}