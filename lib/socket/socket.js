import { SOCKET_EVENTS } from "./events.js";
import { joinUserRoom, leaveUserRoom } from "./room.js";

export function registerSocketHandlers(io) {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    joinUserRoom(socket);
    console.log("====================================");
    console.log("Socket Connected");
    console.log("Socket ID:", socket.id);
    console.log("User:", socket.data.user);
    console.log("====================================");

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      leaveUserRoom(socket);
      console.log("Socket Disconnected:", socket.id);
    });
  });
}
