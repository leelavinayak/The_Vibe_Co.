require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Default values if not in .env
process.env.JWT_SECRET = process.env.JWT_SECRET || 'the_vibe_co_default_secret_key_2026_premium';
process.env.PORT = process.env.PORT || 5002;

const app = express();

// Production Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Set to false if using external resources like Google Fonts/CDNs
}));
app.use(compression());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
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
app.use('/api/test', require('./routes/testRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'THE VIBE CO. API is running', env: process.env.NODE_ENV });
});

// SERVE FRONTEND IN PRODUCTION
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

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
connectDB().then(async () => {
  const PORT = process.env.PORT || 5002;
  app.listen(PORT, async () => {
    console.log(`🎉 THE VIBE CO. Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);

    // Verify notification services on startup
    console.log('\n📋 Verifying notification services...');
    try {
      const sendEmail = require('./services/emailService');
      await sendEmail.verify();
    } catch (err) {
      console.error('❌ Email service startup check failed:', err.message);
    }

    try {
      const sendWhatsAppMessage = require('./services/whatsappService');
      await sendWhatsAppMessage.verify();
    } catch (err) {
      console.error('❌ WhatsApp service startup check failed:', err.message);
    }
    console.log('📋 Service verification complete.\n');
  });
});

