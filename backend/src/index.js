const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const sequelize = require('./config/database');
const { seedDatabase } = require('./seeders/dataSeeder');
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const cardRoutes = require('./routes/cardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const mapRoutes = require('./routes/mapRoutes');
const { authMiddleware } = require('./middleware/authMiddleware');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', authMiddleware, walletRoutes);
app.use('/api/calendar', authMiddleware, calendarRoutes);
app.use('/api/card', authMiddleware, cardRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/map', mapRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');

    // Seed database with demo data
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`CampusMobi API running on http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
