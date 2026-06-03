const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { setIo } = require('./socket');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { hasChatModels } = require('./utils/chatModels');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Socket.IO — real-time chat
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Register singleton so controllers can emit without circular require
setIo(io);

io.on('connection', (socket) => {
  // Client sends { userId, conversationId } after connecting
  socket.on('join', ({ userId, conversationId }) => {
    if (userId) socket.data.userId = userId;
    if (conversationId) {
      socket.join(`conv:${conversationId}`);
      socket.data.conversationId = conversationId;
    }
  });

  // Allow joining a new conversation room on-demand (admin switching chats)
  socket.on('join_conversation', ({ conversationId }) => {
    if (conversationId) {
      socket.join(`conv:${conversationId}`);
      socket.data.conversationId = conversationId;
    }
  });

  // Admin joins a general room to receive inbox updates
  socket.on('join_admin', () => {
    socket.join('admin_room');
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Base Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// Basic connection test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Cosmetic & Bangles Store API is running smoothly!' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error. Please contact administrator.' });
});

// Start Server (use httpServer, not app.listen)
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('[socket.io] Real-time chat enabled');
  if (!hasChatModels()) {
    console.warn(
      '[chat] Prisma client missing Conversation/ChatMessage. Stop server, run: npx prisma generate'
    );
  }
});
