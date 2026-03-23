require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const userRoutes = require('./routes/userRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Frontend Vite server
    methods: ['GET', 'POST']
  }
});

// Attach io to the Express app for controllers to use
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔗 Client connected to Socket.io:', socket.id);

  // Register user online status
  socket.on('register', async (userId) => {
    socket.userId = userId;
    io.emit('userStatus', { userId, isOnline: true });
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });
    } catch(e) {}
  });

  // Clients join a specific Room named by conversationId
  socket.on('joinChat', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('typing', { conversationId, userId });
  });

  socket.on('stopTyping', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('stopTyping', { conversationId, userId });
  });

  // --- WebRTC Video Call Signaling ---
  socket.on('join-video-room', (roomId) => {
    socket.join(roomId);
    // Tell others in the room that this user joined
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('video-offer', (data) => {
    socket.to(data.to).emit('video-offer', { offer: data.offer, from: socket.id });
  });

  socket.on('video-answer', (data) => {
    socket.to(data.to).emit('video-answer', { answer: data.answer, from: socket.id });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.to).emit('ice-candidate', { candidate: data.candidate, from: socket.id });
  });

  socket.on('leave-video-room', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-disconnected', socket.id);
  });
  // -----------------------------------

  socket.on('disconnect', async () => {
    console.log('🔴 Client disconnected:', socket.id);
    if (socket.userId) {
      const lastSeen = new Date();
      io.emit('userStatus', { userId: socket.userId, isOnline: false, lastSeen });
      try {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen });
      } catch(e) {}
    }
  });
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Frontend Vite server
  credentials: true
}));

// Serve uploaded files (Gov IDs etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payment', paymentRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is fully linked and running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server (and Socket.io) running on port ${PORT}`);
});
