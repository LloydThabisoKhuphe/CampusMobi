const express = require('express');
const { body, query, validationResult } = require('express-validator');
const CalendarService = require('../services/calendarService');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }
  next();
};

// GET /calendar/events
router.get('/events',
  query('date').optional().isISO8601().withMessage('Invalid date format'),
  query('month').optional().matches(/^\d{4}-\d{2}$/).withMessage('Invalid month format (YYYY-MM)'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const events = await CalendarService.getEvents(
        req.user.userId,
        req.query.date,
        req.query.month
      );
      res.json(events);
    } catch (error) {
      next(error);
    }
  }
);

// POST /calendar/events
router.post('/events',
  body('date').isISO8601().withMessage('Invalid date format'),
  body('time').matches(/^\d{2}:\d{2}$/).withMessage('Invalid time format (HH:MM)'),
  body('title').notEmpty().withMessage('Title is required'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      if (req.user.isGuest) {
        throw new ApiError(403, 'Guests cannot create calendar events');
      }
      
      const event = await CalendarService.createEvent(req.user.userId, req.body);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /calendar/events/:id
router.delete('/events/:id', async (req, res, next) => {
  try {
    if (req.user.isGuest) {
      throw new ApiError(403, 'Guests cannot delete calendar events');
    }
    
    const result = await CalendarService.deleteEvent(req.user.userId, parseInt(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
