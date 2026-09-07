const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 120]
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true, // NULL for guest accounts
  },
  fullName: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      len: [1, 150]
    }
  },
  studentId: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('STUDENT', 'ADMIN'),
    defaultValue: 'STUDENT',
    allowNull: false
  },
  guest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
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
  tableName: 'users',
  timestamps: true,
  underscored: false
});

module.exports = User;
