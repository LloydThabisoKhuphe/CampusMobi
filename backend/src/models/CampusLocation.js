const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CampusLocation = sequelize.define('CampusLocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'e.g., Library, Cafeteria, Sports, Lab'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'campus_locations',
  timestamps: true
});

module.exports = CampusLocation;
