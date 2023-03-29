
const express = require('express');
const app = express();
const cors = require('cors')
const { Server } = require("socket.io");
const { Configuration, OpenAIApi } = require("openai");

const server = require('http').createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["*"],
    },
  });

// Open ai api request
  const OPENAI_API_KEY = "sk-TB0Mhxq9JDQ5aZTvX6lfT3BlbkFJ3vYZlWiqGDuQnfg6OQOusk-TB0Mhxq9JDQ5aZTvX6lfT3BlbkFJ3vYZlWiqGDuQnfg6OQOu"
  const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  
  
// Serve static files from the public folder
app.use(express.static('public'));


// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Listen for incoming connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for incoming chat messages
  socket.on('chat message', (msg) => {
    // testing ...
    console.log(`${msg} received`);
    // msg reverse testing
    const reversed = msg.split('').reverse().join('');
    // Chatbot api fetch with message
    const completion = (msg) => openai.createCompletion({ 
      model: "text-davinci-003",
      prompt: msg,
    });
    console.log(completion.data.choices[0].text);
    // Emit the message to all connected clients
    socket.emit('chat response', completion.data.choices[0].text);
  });

// on docker limit 5 connections
  // Listen for disconnections
  // socket.on('disconnect', () => {
  //   console.log('A user disconnected');
  // });
});