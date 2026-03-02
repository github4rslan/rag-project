require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const authRoutes     = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const chatRoutes     = require('./routes/chat');
const userRoutes = require('./routes/user');
const { protect }    = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (need login)
app.use('/api/documents', protect, documentRoutes);
app.use('/api/chat',      protect, chatRoutes);
app.use('/api/user', protect, userRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB error:', err));