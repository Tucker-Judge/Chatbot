const express = require('express');
const app = express();
const cors = require('cors')
const { Server } = require("socket.io");

const server = require('http').createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["*"],
    },
  });

// Serve static files from the public folder
app.use(express.static('public'));

// Listen for incoming connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for incoming chat messages
  socket.on('chat message', (msg) => {
    console.log('Message received: ' + msg);

    // Emit the message to all connected clients
    io.emit('chat message', msg);
  });

  // Listen for disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
