const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentCard = sequelize.define('StudentCard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  cardNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'SUSPENDED', 'EXPIRED'),
    defaultValue: 'ACTIVE'
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  tableName: 'student_cards',
  timestamps: true
});

module.exports = StudentCard;
