const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceItem = sequelize.define('ServiceItem', {
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
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Icon name or emoji'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: true
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
  tableName: 'service_items',
  timestamps: true
});

module.exports = ServiceItem;
