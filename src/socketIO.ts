import { Server } from "socket.io";

let socketIO: Server;

export let init = (httpServer: any): Server => {
  socketIO = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
    },
  });
  return socketIO;
};

export let getSocketIO = (): Server => {
  if (!socketIO) {
    throw new Error("Socket.io is not initialised");
  }
  return socketIO;
};
