const { Server } = require("socket.io");

let socketIO;

module.exports = {
    init: httpServer => {
        socketIO = new Server(httpServer, {
            cors: {
              origin: 'http://localhost:3000'
            }
          });
        return socketIO;
    },
    getSocketIO: () => {
        if (!socketIO) {
            throw new Error ('Socket.io is not initialised');
        }
        return socketIO;
    }
}