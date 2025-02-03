const { Server } = require('socket.io');

let io;

function initializeSocket(server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: '*', // Change this to match your frontend URL in production
      },
    });

    io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`);

      socket.on('sendMessage', (message) => {
        io.emit('newMessage', message);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
  return io;
}

module.exports = { initializeSocket, getIo: () => io };
