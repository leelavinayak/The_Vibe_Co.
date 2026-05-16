require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'the_vibe_co_default_secret_key_2026_premium';
process.env.PORT = process.env.PORT || 5002;

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to database is handled below

const app = express();

// Middleware
app.use(cors());
app.use(require('morgan')('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/provider-mgmt', require('./routes/providerManagementRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'THE VIBE CO. API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
});

// Connect to database and start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5002;
  const server = app.listen(PORT, () => {
    console.log(`🎉 THE VIBE CO. Server running on port ${PORT}`);
  });
});
