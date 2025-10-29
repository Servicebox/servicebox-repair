// src/lib/socket.js
import { Server } from 'socket.io';

// Use relative imports instead of alias for now
import Message from '../models/Message.js';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinChat', ({ userId, adminId }) => {
      const room = [userId, adminId].sort().join('_');
      socket.join(room);
    });

    socket.on('sendMessage', async (message) => {
      try {
        const newMessage = await Message.create(message);
        const room = [message.senderId, message.receiverId].sort().join('_');
        io.to(room).emit('newMessage', newMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}