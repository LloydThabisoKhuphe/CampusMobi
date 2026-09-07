const User = require('./User');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const CalendarEvent = require('./CalendarEvent');
const Notification = require('./Notification');
const StudentCard = require('./StudentCard');
const CampusLocation = require('./CampusLocation');
const ServiceItem = require('./ServiceItem');

// Define associations
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

User.hasMany(CalendarEvent, { foreignKey: 'userId', as: 'calendarEvents' });
CalendarEvent.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(StudentCard, { foreignKey: 'userId', as: 'studentCard' });
StudentCard.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Wallet,
  Transaction,
  CalendarEvent,
  Notification,
  StudentCard,
  CampusLocation,
  ServiceItem
};
