const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const onlineUsers = new Set();
const messageHistory = [];
const MAX_MESSAGES = 50;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.emit('messageHistory', messageHistory);


  socket.on('userJoined', (data) => {
    console.log(`${data.username} joined the chat`);
    onlineUsers.add(data.username);
    
    const joinMessage = {
      username: data.username,
      type: 'notification',
      text: `${data.username} đã tham gia cuộc trò chuyện`,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    io.emit('userJoined', joinMessage);
    
    messageHistory.push(joinMessage);
    if (messageHistory.length > MAX_MESSAGES) {
      messageHistory.shift(); 
    }
  });

  socket.on('message', (data) => {
    console.log('Message received:', data);
    
    const messageData = {
      ...data,
      type: 'message'
    };
    
    messageHistory.push(messageData);
    if (messageHistory.length > MAX_MESSAGES) {
      messageHistory.shift();
    }
    io.emit('message', messageData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});