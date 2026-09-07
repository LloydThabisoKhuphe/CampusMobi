const { Notification } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

class NotificationService {
  static async getNotifications(userId) {
    // Get both user-specific and broadcast notifications
    const notifications = await Notification.findAll({
      where: {
        [Op.or]: [
          { userId },
          { isBroadcast: true, userId: null }
        ]
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'message', 'type', 'isRead', 'createdAt']
    });

    return notifications;
  }

  static async markAsRead(userId, notificationId) {
    const notification = await Notification.findByPk(notificationId);

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    // Check if user can access this notification
    if (notification.userId !== userId && !notification.isBroadcast) {
      throw new ApiError(403, 'You cannot access this notification');
    }

    notification.isRead = true;
    await notification.save();

    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt
    };
  }

  static async createNotification(userId, title, message, type = 'INFO', isBroadcast = false) {
    const notification = await Notification.create({
      userId: isBroadcast ? null : userId,
      title,
      message,
      type,
      isBroadcast
    });

    return notification;
  }
}

module.exports = NotificationService;
