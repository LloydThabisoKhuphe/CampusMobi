const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

let sequelize;

if (env === 'production' && process.env.DB_URL) {
  // PostgreSQL for production
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });
} else {
  // SQLite for development
  const dbPath = path.join(__dirname, '../../data/campusmobi.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
    define: {
      timestamps: true,
      underscored: false
    }
  });
}

module.exports = sequelize;
