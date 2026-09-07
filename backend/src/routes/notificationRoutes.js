const express = require('express');
const NotificationService = require('../services/notificationService');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /notifications
router.get('/', async (req, res, next) => {
  try {
    const notifications = await NotificationService.getNotifications(req.user.userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// PATCH /notifications/:id/read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const result = await NotificationService.markAsRead(req.user.userId, parseInt(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
